/*jslint node: true, nomen: true, regexp: true, plusplus: true */
(function () {

    "use strict";

    const   BlockUtils      = require("./blockutils");

    /**
     * Blockfolio API Client
     */
    class Blockfolio {

        constructor(fiatCurrency, apiUrl, magicToken, locale, platform, signalApiUrl, perSecondRateLimit) {
            this.CLIENT_TOKEN = null;
            this.FIAT_CURRENCY = fiatCurrency;
            this.LOCALE = locale;
            this.PLATFORM = platform;
            this.utils = new BlockUtils(apiUrl, magicToken, signalApiUrl, perSecondRateLimit);
            this.coins = {};
            this.USE_ALIAS = "true";
        }

        /**
         * Initiialization of own datas
         * @param   {Object}  options
         * @param   {Boolean} options.disableCoinCheck    Don't fetch available coins at startup
         * @callback
         * @returns {Promise}
         */
        init() {
            return this.utils._handlePromises(arguments, 1, ({
                disableCoinCheck = false
            } = {}, callback) => {
                this.CLIENT_TOKEN = arguments[0];
                if (!this._checkClientToken()) {
                    return callback(new Error("Invalid CLIENT_TOKEN"));
                }
                if (disableCoinCheck) { return callback(); }
                return this._refreshCoins().then(() => {
                    return callback();
                }).catch(callback);
            });
        }

        /**
         * Register for a new device token on Blockfolio
         * @param clientToken
         * @callback
         * @returns {Promise}
         * @private
         */
        _register() {
            return this.utils._handlePromises(arguments, 1, ({} = {}, callback) => {
                this.utils.call(`register/${arguments[0]}?platform=${this.PLATFORM}`, (err, response) => {
                    if (response === "success") {
                        return callback();
                    } else {
                        return callback(new Error("Unable to create new device token !"));
                    }
                });
            });
        }

        /**
         * Refresh internal list of coins
         * @callback
         * @returns {Promise}
         * @private
         */
        _refreshCoins() {
            return this.utils._handlePromises(arguments, 0, ({} = {}, callback) => {
                this.getCoinsList().then((coins) => {
                    this.coins = coins;
                    callback(null);
                }).catch(callback);
            });
        }

        /**
         * Check validity of a client token
         * @returns {boolean}
         * @private
         */
        _checkClientToken() {
            // TODO: Maybe check a specific endpoint for the validity of the token / store it ?
            if (this.CLIENT_TOKEN === null) { return false; }
            if (this.CLIENT_TOKEN.match(/[a-f0-9]{96}/)) {
                console.warn("You seem to be using a disposable token, check the README to see how to get your DEVICE_TOKEN!");
                return false;
            }
            return true;
        }

        /**
         * Check if the required token pair exists in local list, else, replace it with a new one
         * @param       {String|Object}   pair
         * @callback
         * @returns     {Promise}
         * @private
         */
        _validateTokenPair() {
            return this.utils._handlePromises(arguments, 1, ({} = {}, callback) => {
                if (Object.keys(this.coins).length === 0) {
                    return callback(new Error("coinsList uninitialized, could not validate token pairs!"));
                }
                const pair = this.utils.parseToken(arguments[0]);

                for(let i in this.coins) {
                    const coin = this.coins[i];
                    if ((pair.base === coin.base) &&
                        (pair.token === coin.aliasTokenSymbol
                            || pair.token === coin.standardTokenSymbol
                            || pair.token === coin.displayedTokenSymbol)) {
                        return callback(null, pair);
                    }
                }

                return callback(new Error(`${pair.token}/${pair.base} is not an available token on Blockfolio!`));
            });
        }

        /**
         * Add a position on Blockfolio
         * @param {String|Object}   pair                Which coin do you want to add ?
         * @param {Object}          options
         * @param {String}          options.mode        "sell" or "buy"
         * @param {Number}          options.amount      Number of coin included in the transaction
         * @param {String}          options.note        A note to add to the transaction on Blockfolio
         * @param {Number}          options.timestamp   Timestamp of the time of the transaction
         * @param {String}          options.exchange    Name of the exchange where the transaction is made (Blockfolio format, see getExchanges)
         * @param {Number}          options.price       Price of one coin when the transaction was realized
         * @callback
         * @returns {Promise}
         */
        addPosition() {
            return this.utils._handlePromises(arguments, 1, ({
                mode        = "buy",
                amount      = 0,
                note        = "",
                timestamp   = new Date().getTime(),
                exchange    = null,
                price       = null
            } = {}, callback) => {
                if (arguments.length < 1) {
                    return callback(new Error("You must provide a token to add to your position!"));
                }
                return this._validateTokenPair(arguments[0]).then((pair) => {
                    amount = (mode === "buy") ? amount : 0 - amount;
                    note = encodeURIComponent(note);
                    const doCall = () => {
                        return this.utils.call(`add_position_v2/${this.CLIENT_TOKEN}/1/${pair.token}/${pair.base}/${exchange}/${price}/${amount}/${timestamp}/0?platform=${this.PLATFORM}&note=${note}&use_alias=${this.USE_ALIAS}`).then(() => {
                            return callback();
                        });
                    };
                    const checkPrice = () => {
                        if (price == null) {
                            return this.getPrice(pair, {
                                exchange: exchange
                            }).then((rPrice) => {
                                price = rPrice;
                                return doCall();
                            });
                        } else {
                            return doCall();
                        }
                    };
                    if (exchange === null) {
                        return this.getExchanges(pair).then((exchanges) => {
                            exchange = exchanges[0];
                            return checkPrice();
                        });
                    } else {
                        return checkPrice();
                    }

                }).catch(callback);
            });
        }

        /**
         * Remove a position from his ID
         * @param {String|Number} positionId
         * @callback
         * @returns {Promise}
         */
        removePosition() {
            return this.utils._handlePromises(arguments, 1, ({} = {}, callback) => {
                if (arguments.length !== 1 || typeof arguments[0] === "undefined") {
                    return callback(new Error("You must provide a position ID!"));
                }

                return this.utils.call(`remove_position/${this.CLIENT_TOKEN}/${arguments[0]}`).then(() => {
                    return callback();
                }).catch(callback);
            });
        }

        /**
         * Blockfolio introduced the concept of "Disposable Device Token" in latest builds to block the API Client,
         * this is how to get it with a proper CLIENT_TOKEN set...
         * @callback
         * @returns {Promise}
         */
        getDisposableDeviceToken() {
            return this.utils._handlePromises(arguments, 0, ({} = {}, callback) => {
                return this.utils.call(`device/${this.CLIENT_TOKEN}`, {
                    method: "POST",
                    body: JSON.stringify({token: this.CLIENT_TOKEN})
                }, (err, pBody) => {
                    return callback(null, pBody);
                });
            });
        }

        /**
         * Retrieve the list of set alerts for a specific token
         * @param   {String|Object} pair Token pair (ie. GNT/BTC)
         * @callback
         * @return  {Promise}
         */
        getAlerts() {
            return this.utils._handlePromises(arguments, 1, ({} = {}, callback) => {
                if (arguments.length < 1) {
                    return callback(new Error("You must provide a pair to get alerts from!"));
                }
                return this._validateTokenPair(arguments[0]).then((pair) => {
                    return this.utils.call(`get_alerts/${this.CLIENT_TOKEN}?coin=${pair.token}&base=${pair.base}&locale=${this.LOCALE}&use_alias=${this.USE_ALIAS}`).then((pBody) => {
                        if (typeof pBody.alertList === "undefined") {
                            return callback(new Error("Unable to fetch alerts for this pair!"));
                        }

                        return callback(null, pBody.alertList);
                    });
                }).catch(callback);
            });
        }

        /**
         * Add an alert on specified token when crossing a boundary
         * @param {String|Object}   pair                Token pair (ie. LSK/BTC)
         * @param {Object}          options
         * @param {Number}          options.above       Upper price to trigger the alert
         * @param {Number}          options.below       Lower price to trigger the alert
         * @param {Boolean}         options.persistent  If let to false, alert triggers only once
         * @param {String}          options.exchange    Exchange name (Blockfolio format, see getExchanges)
         * @callback
         * @return {Promise}
         */
        addAlert() {
            return this.utils._handlePromises(arguments, 1, ({
                above = 0,
                below = 0,
                persistent = false,
                exchange = null
            } = {}, callback) => {
                if (arguments.length < 1) {
                    return callback(new Error("You must provide a pair to set alerts!"));
                }
                if (above === 0 && below === 0) { return callback(new Error("You must specify at leat a boundary to set up an alert!")); }
                return this._validateTokenPair(arguments[0]).then((pair) => {
                    const doCall = () => {
                        persistent = persistent ? 1 : 0;

                        return this.utils.call(`add_alert/${this.CLIENT_TOKEN}/5/${pair.token}/${pair.base}/${exchange}/${above}/${below}/${persistent}?platform=${this.PLATFORM}&use_alias=${this.USE_ALIAS}`).then(() => {
                            return callback();
                        });
                    };

                    if (exchange === null) {
                        return this.getExchanges(pair).then((exchanges) => {
                            exchange = exchanges[0];
                            return doCall();
                        });
                    } else {
                        return doCall();
                    }
                }).catch(callback);
            });
        }

        _basicAlertAction(action, args) {
            return this.utils._handlePromises(args, 0, ({} = {}, callback) => {
                if (args.length !== 1 || typeof args[0] === "undefined") {
                    return callback(new Error("You must provide an alert ID!"));
                }

                return this.utils.call(`${action}/${this.CLIENT_TOKEN}/${args[0]}?use_alias=${this.USE_ALIAS}`).then(() => {
                    return callback();
                }).catch(callback);
            });
        }

        /**
         * Remove an alert from his ID
         * @param {String|Number} alertId
         * @callback
         * @returns {Promise}
         */
        removeAlert() {
            return this._basicAlertAction("remove_alert", arguments);
        }

        /**
         * Pause an alert from his ID
         * @param {String|Number} alertId
         * @callback
         * @returns {Promise}
         */
        pauseAlert() {
            return this._basicAlertAction("pause", arguments);
        }

        /**
         * Start an alert from his ID
         * @param {String|Number} alertId
         * @callback
         * @returns {Promise}
         */
        startAlert() {
            return this._basicAlertAction("start", arguments);
        }

        /**
         * Start all alerts on a specified pair
         * @param {String|Number} alertId
         * @callback
         * @returns {Promise}
         */
        startAllAlerts() {
            return this.utils._handlePromises(arguments, 1, ({} = {}, callback) => {
                if (arguments.length !== 1) {
                    return callback(new Error("You must provide a pair to start alerts!"));
                }

                return this._validateTokenPair(arguments[0]).then((pair) => {
                    return this.utils.call(`start_all/${this.CLIENT_TOKEN}/${pair.token}/${pair.base}?use_alias=${this.USE_ALIAS}`).then(() => {
                        return callback();
                    });
                }).catch(callback);
            });
        }

        /**
         * Pause all alerts on a specified pair
         * @param {String|Number} alertId
         * @callback
         * @returns {Promise}
         */
        pauseAllAlerts() {
            return this.utils._handlePromises(arguments, 1, ({} = {}, callback) => {
                if (arguments.length !== 1) {
                    return callback(new Error("You must provide a pair to pause alerts!"));
                }

                return this._validateTokenPair(arguments[0]).then((pair) => {
                    return this.utils.call(`pause_all/${this.CLIENT_TOKEN}/${pair.token}/${pair.base}?use_alias=${this.USE_ALIAS}`).then(() => {
                        return callback();
                    });
                }).catch(callback);
            });
        }

        /**
         * Add a token to your watchlist without any open position
         * @param pair Token pair (ie. STR/BTC)
         * @param exchange Name of the exchange (Blockfolio format, see getExchanges)
         * @callback
         */
        watchCoin() {
            return this.utils._handlePromises(arguments, 1, (options = {
                exchange = null
            } = {}, callback) => {
                return this.addPosition(arguments[0], options, callback);
            });
        }

        /**
         * Get the last ticker price of selected token pair
         * @param {String|Object}   pair                Token pair (ie. ADA/BTC)
         * @param {Object}          options
         * @param {String}          options.exchange    Specific exchange to check for the price (Blockfolio format, see getExchanges)
         * @callback
         * @returns {Promise}
         */
        getPrice() {
            return this.utils._handlePromises(arguments, 1, ({
                exchange = null
            } = {}, callback) => {
                return this._validateTokenPair(arguments[0]).then((pair) => {
                    const doCall = () => {
                        return this.utils.call(`lastprice/${exchange}/${pair.base}-${pair.token}?locale=${this.LOCALE}&use_alias=${this.USE_ALIAS}`,
                            (err, pBody) => {

                            if (err || typeof pBody.last === "undefined" || pBody.last <= 0) {
                                return callback(new Error("Unable to fetch last price !"));
                            }

                            return callback(null, pBody.last);
                        });
                    };

                    if (exchange === null) {
                        return this.getExchanges(pair).then((exchanges) => {
                            exchange = exchanges[0];
                            return doCall();
                        });
                    } else {
                        return doCall();
                    }
                }).catch(callback);
            });
        }

        /**
         * List Blockfolio announcements
         * @callback
         * @returns {Promise}
         */
        getAnnouncements() {
            return this.utils._handlePromises(arguments, 0, ({} = {}, callback) => {
                return this.utils.call("announcements", { useSignalAPI: true }).then((pBody) => {
                    if (typeof pBody.announcements === "undefined") {
                        return callback(new Error("Unable to fetch announcements"));
                    }

                    return callback(null, pBody.announcements);
                }).catch(callback);
            });
        }

        /**
         * Get the version number of Blockfolio API
         * @callback
         * @returns {Promise}
         */
        getVersion() {
            return this.utils._handlePromises(arguments, 0, ({} = {}, callback) => {
                return this.utils.call(`version?platform=${this.PLATFORM}`).then((pBody) => {
                    if (typeof pBody.version === "undefined") {
                        return callback(new Error("Unable to fetch version number"));
                    }

                    return callback(null, pBody.version);
                }).catch(callback);
            });
        }

        /**
         * Retrieve a system status message if present
         * @param callback
         * @returns {Promise}
         */
        getStatus() {
            return this.utils._handlePromises(arguments, 0, ({} = {}, callback) => {
                return this.utils.call(`system_status?platform=${this.PLATFORM}`).then((pBody) => {
                    if (typeof pBody.status === "undefined") {
                        return callback(new Error("Unable to fetch version number"));
                    }

                    return callback(null, pBody.status);
                }).catch(callback);
            });
        }

        /**
         * Get available exchanges for selected pair
         * @param pair Token pair (ie. MMN/BTC)
         * @callback
         * @returns {Promise}
         */
        getExchanges() {
            return this.utils._handlePromises(arguments, 1, ({} = {}, callback) => {
                return this._validateTokenPair(arguments[0]).then((pair) => {
                    return this.utils.call(`exchangelist_v2/${pair.base}-${pair.token}`).then((pBody) => {
                        if (typeof pBody.exchange === "undefined" || pBody.exchange.length < 1) {
                            return callback(new Error("Unable to get available exchanges for this token !"));
                        }

                        return callback(null, pBody.exchange);
                    });
                }).catch(callback)
            });
        }

        /**
         * Return a summary of the user's portfolio
         * @callback
         */
        getPortfolioSummary() {
            return this.utils._handlePromises(arguments, 0, ({} = {}, callback) => {

                if (!this._checkClientToken()) {
                    return callback(new Error("A valid CLIENT_TOKEN should be provided! (Have you called Blockfolio.init()?)"));
                }

                return this.utils.call(`get_all_positions/${this.CLIENT_TOKEN}?use_alias=${this.USE_ALIAS}&fiat_currency=${this.FIAT_CURRENCY}`).then((pBody) => {
                    if (typeof pBody.portfolio === "undefined") {
                        return callback(new Error("Bad response"));
                    }

                    return callback(null, pBody.portfolio);
                }).catch(callback);

            });
        }

        /**
         * Return all active user's positions
         * @param pair Token pair symbol (ie. "XVG/BTC")
         * @callback                Optionnal if given as first argument
         * @returns {Promise}
         */
        getPositions() {
            const offset = (["undefined", "function"].indexOf(typeof arguments[0]) === -1) ? 1 : 0;
            return this.utils._handlePromises(arguments, offset, ({} = {}, callback) => {

                if (!this._checkClientToken()) {
                    return callback(new Error("A valid CLIENT_TOKEN should be provided! (Have you called Blockfolio.init()?)"));
                }

                if (offset === 0) {
                    return this.utils.call(`get_all_positions/${this.CLIENT_TOKEN}?use_alias=${this.USE_ALIAS}&fiat_currency=${this.FIAT_CURRENCY}`).then((pBody) => {
                        if (typeof pBody.positionList === "undefined") {
                            return callback(new Error("Bad response"));
                        }

                        return callback(null, pBody.positionList);
                    }).catch(callback);
                } else {
                    return this._validateTokenPair(arguments[0]).then((pair) => {
                        return this.utils.call(`get_positions_v2/${this.CLIENT_TOKEN}/${pair.base}-${pair.token}?use_alias=${this.USE_ALIAS}&fiat_currency=${this.FIAT_CURRENCY}&locale=${this.LOCALE}`).then((pBody) => {
                            if (typeof pBody.positionList === "undefined") {
                                return callback(new Error("Bad response"));
                            }

                            return callback(null, pBody.positionList);
                        });
                    }).catch(callback);
                }
            });
        }

        /**
         * List the available currencies on the app
         * @callback
         * @returns {Promise}
         */
        getCurrencies(callback) {
            return this.utils._handlePromises(arguments, 0, ({} = {}, callback) => {
                return this.utils.call("currency").then((pBody) => {

                    if (typeof pBody.currencyList === "undefined") {
                        return callback(new Error("Bad response"));
                    }

                    return callback(null, pBody.currencyList);
                }).catch(callback);
            });
        }

        /**
         * Get summary of all positions regarding the specified token
         * @param pair Token pair symbol (ie. "XLM/BTC")
         * @param callback
         * @returns {Promise}
         */
        getHoldings() {
            return this.utils._handlePromises(arguments, 1, ({} = {}, callback) => {
                if (!this._checkClientToken()) {
                    return callback(new Error("A valid CLIENT_TOKEN should be provided! (Have you called Blockfolio.init()?)"));
                }

                return this._validateTokenPair(arguments[0]).then((pair) => {
                    return this.utils.call(`get_combined_position/${this.CLIENT_TOKEN}/${pair.base}-${pair.token}?use_alias=${this.USE_ALIAS}&fiat_currency=${this.FIAT_CURRENCY}&locale=${this.LOCALE}`).then((pBody) => {
                        if (typeof pBody.holdings === "undefined") {
                            return callback(new Error("Bad response"));
                        }

                        return callback(null, pBody.holdings);
                    });
                }).catch(callback)
            });
        }

        /**
         * Get the whole list of available coins on Blockfolio
         * @param callback
         * @returns {Promise}
         */
        getCoinsList(callback) {
            return this.utils._handlePromises(arguments, 0, ({} = {}, callback) => {
                return this.utils.call("coinlist_v6").then((pBody) => {
                    if (typeof pBody.coins === "undefined") {
                        return callback(new Error("Bad response"));
                    }

                    return callback(null, pBody.coins);
                }).catch(callback);
            });
        }

        /**
         * Remove the coin, and all transactions related
         * @param pair Token pair symbol (ie. "LTC/BTC")
         * @callback
         * @returns {Promise}
         */
        removeCoin() {
            return this.utils._handlePromises(arguments, 1, ({} = {}, callback) => {
                if (!this._checkClientToken()) {
                    return callback(new Error("A valid CLIENT_TOKEN should be provided! (Have you called Blockfolio.init()?)"));
                }

                return this._validateTokenPair(arguments[0]).then((pair) => {
                    return this.utils.call(`remove_all_positions/${this.CLIENT_TOKEN}/${pair.base}-${pair.token}?use_alias=${this.USE_ALIAS}`).then((pBody) => {
                        return callback(null, pBody);
                    });
                }).catch(callback);
            });
        }

        /**
         * Retrieve market infos from Blockfolio for this pair on specified exchange
         * @param pair Token Pair (ie. "BYTE/BTC")
         * @param {Object} options
         * @param {String} options.exchange Name of the exchange (Blockfolio format, see getExchanges)
         * @callback
         * @returns {Promise}
         */
        getMarketDetails() {
            return this.utils._handlePromises(arguments, 1, ({
                exchange = null
            } = {}, callback) => {
                if (!this._checkClientToken()) {
                    return callback(new Error("A valid CLIENT_TOKEN should be provided! (Have you called Blockfolio.init()?)"));
                }

                const doCall = (pair) => {
                    return this.utils.call(`marketdetails_v2/${this.CLIENT_TOKEN}/${exchange}/${pair.base}-${pair.token}?use_alias=${this.USE_ALIAS}&locale=${this.LOCALE}&fiat_currency=${this.FIAT_CURRENCY}`).then((pBody) => {
                        return callback(null, pBody);
                    }).catch(callback);
                };

                return this._validateTokenPair(arguments[0]).then((pair) => {
                    if (exchange === null) {
                        return this.getExchanges(pair).then((exchanges) => {
                            exchange = exchanges[0];
                            return doCall(pair);
                        });
                    } else {
                        return doCall(pair);
                    }
                }).catch(callback);
            });
        }

    }

    module.exports = Blockfolio;

})();