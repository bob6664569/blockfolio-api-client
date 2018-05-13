/*jslint node: true, nomen: true, regexp: true, plusplus: true */
(function () {

    "use strict";

    const   BlockUtils      = require("./blockutils");

    /**
     *
     * Blockfolio API Endpoints
     *
     * /register/{token}?platform={platform}
     * /lastprice/{exchange}/{base}-{tokenSymbol}?locale={_}&use_alias=true
     * /coinlist_v6
     * /get_all_positions/{token}?fiat_currency={r}&locale={_}&use_alias=true
     * /exchangelist_v2/{base}-{tokenSymbol}
     * /currency
     * /news?{e}
     * /updateUserExchange?token={n}&coin={tokenSymbol}&base={base}&exchange={g(t)}
     * /news_sources
     * /updateUserCoinToken?token={t}{e}
     * /add_position_v2/{token}/1/{tokenSymbol}/{base}/{ref}/{price}/{quantity}/{r}/{watch}/?platform={platform}&note={o}&use_alias=true
     * /updateToken/{e}/{t}
     * /edit_position_v3/{token}/{id}/{tokenSymbol}/{n}/{price}/{quantity}/{r}/{watch}/?platform={platform}&note={o}
     * /remove_position/{token}/{id}
     * /remove_alert/{token}/{e}?use_alias=true
     * /remove_all_positions/{token}/{base}-{tokenSymbol}?use_alias=true
     * /marketdetails_v2/{token}/{o}/{base}-{tokenSymbol}?fiat_currency={r}&locale={_}&use_alias=true
     * /orderbook/{token}/{base}-{tokenSymbol}?locale={_}&use_alias=true
     * /get_alerts/{token}?coin={e}&base={t}&locale={_}&use_alias=true
     * /add_alert/{token}/{id}/{tokenSymbol}/{base}/{n}/{above}/{below}/{frequency}?platform={platform}&use_alias=true
     * /edit_alert/{token}/{id}/{n}/{above}/{below}/{frequency}?use_alias=true
     * /pause/{token}/{e}?use_alias=true
     * /start/{token}/{e}?use_alias=true
     * /start_all/{token}/{tokenSymbol}/{base}?use_alias=true
     * /get_positions_v2/{token}/{base}-{tokenSymbol}/?fiat_currency={r}&locale={_}&use_alias=true
     * /get_combined_position/{token}/{base}-{tokenSymbol}?fiat_currency={r}&locale={_}&use_alias=true
     * /get_coin_summary/{token}/{base}-{tokenSymbol}?fiat_currency={r}&locale={_}&use_alias=true
     * /candlestick/{r}/{u}/{base}-{tokenSymbol}/{t}?locale={_}&fiat_currency={r}&use_alias=true
     * /portfolio_v2/{token}/{period}?fiat_currency={r}&locale={_}&use_alias=true
     * /version?platform={platform}
     * /change_log?platform={platform}
     * /system_status?platform={platform}
     * /error_log?platform={platform}
     * /add_ico?token={token}&id={e}
     * /remove_ico?token={token}&id={e}
     * /ico
     * /announcements
     *
     * Tools
     * periods: {"1D":"day","1W":"week","1M":"month","3M":"3month","6M":"6month","1Y":"year",ALL:"all"}
     */

    class Blockfolio {

        constructor(fiatCurrency, apiUrl, magicToken, locale, platform, signalApiUrl) {
            this.CLIENT_TOKEN = null;
            this.FIAT_CURRENCY = fiatCurrency;
            this.LOCALE = locale;
            this.PLATFORM = platform;
            this.utils = new BlockUtils(apiUrl, magicToken, signalApiUrl);
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
                this._refreshCoins().then(() => {
                    return callback();
                }).catch((err) => {
                    return callback(err);
                });
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
                }).catch((err) => { return callback(err); });
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
                this._validateTokenPair(arguments[0]).then((pair) => {
                    amount = (mode === "buy") ? amount : 0 - amount;
                    note = encodeURIComponent(note);
                    const doCall = () => {
                        this.utils.call(`add_position_v2/${this.CLIENT_TOKEN}/1/${pair.token}/${pair.base}/${exchange}/${price}/${amount}/${timestamp}/0?platform=${this.PLATFORM}&note=${note}&use_alias=${this.USE_ALIAS}`).then(() => {
                            return callback();
                        }).catch((err) => { return callback(err); });
                    };
                    const checkPrice = () => {
                        if (price == null) {
                            this.getPrice(pair, exchange, (err, rPrice) => {
                                if (err) { return callback(err); }

                                price = rPrice;
                                doCall();
                            });
                        } else {
                            doCall();
                        }
                    };
                    if (exchange === null) {
                        this.getExchanges(pair, (err, exchanges) => {
                            if (err) { return callback(err); }

                            exchange = exchanges[0];
                            checkPrice();
                        });
                    } else {
                        checkPrice();
                    }

                }).catch((err) => { return callback(err); });
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

                this.utils.call(`remove_position/${this.CLIENT_TOKEN}/${arguments[0]}`).then(() => {
                    return callback();
                }).catch((err) => { return callback(err); });
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
                this.utils.call(`device/${this.CLIENT_TOKEN}`, {
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
            if (arguments.length < 1) {
                return callback(new Error("You must provide a pair to get alerts from!"));
            }
            return this.utils._handlePromises(arguments, 1, ({} = {}, callback) => {
                this._validateTokenPair(arguments[0]).then((pair) => {
                    this.utils.call(`get_alerts/${this.CLIENT_TOKEN}?coin=${pair.token}&base=${pair.base}&locale=${this.LOCALE}&use_alias=${this.USE_ALIAS}`).then((pBody) => {
                        if (typeof pBody.alertList === "undefined") {
                            return callback(new Error("Unable to fetch alerts for this pair!"));
                        }

                        return callback(null, pBody.alertList);
                    }).catch((err) => { return callback(err); });
                }).catch((err) => { return callback(err); });
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
            if (arguments.length < 1) {
                return callback(new Error("You must provide a pair to set alerts!"));
            }
            return this.utils._handlePromises(arguments, 1, ({
                above = 0,
                below = 0,
                persistent = false,
                exchange = null
            } = {}, callback) => {
                if (above === 0 && below === 0) { return callback(new Error("You must specify at leat a boundary to set up an alert!")); }
                this._validateTokenPair(arguments[0]).then((pair) => {
                    const doCall = () => {
                        persistent = persistent ? 1 : 0;

                        this.utils.call(`add_alert/${this.CLIENT_TOKEN}/5/${pair.token}/${pair.base}/${exchange}/${above}/${below}/${persistent}?platform=${this.PLATFORM}&use_alias=${this.USE_ALIAS}`).then(() => {
                            return callback();
                        }).catch((err) => {
                            return callback(err);
                        });
                    };

                    if (exchange === null) {
                        this.getExchanges(pair).then((exchanges) => {
                            exchange = exchanges[0];
                            doCall();
                        }).catch((err) => { return callback(err); });
                    } else {
                        doCall();
                    }
                }).catch((err) => { return callback(err); });
            });
        }

        /**
         * Remove an alert from his ID
         * @param {String|Number} alertId
         * @callback
         * @returns {Promise}
         */
        removeAlert() {
            return this.utils._handlePromises(arguments, 1, ({} = {}, callback) => {
                if (arguments.length !== 1 || typeof arguments[0] === "undefined") {
                    return callback(new Error("You must provide an alert ID!"));
                }

                this.utils.call(`remove_alert/${this.CLIENT_TOKEN}/${arguments[0]}?use_alias=${this.USE_ALIAS}`).then(() => {
                    return callback();
                }).catch((err) => { return callback(err); });
            });
        }

        /**
         * Pause an alert from his ID
         * @param {String|Number} alertId
         * @callback
         * @returns {Promise}
         */
        pauseAlert() {
            return this.utils._handlePromises(arguments, 0, ({} = {}, callback) => {
                if (arguments.length !== 1) {
                    return callback(new Error("You must provide an alert ID!"));
                }

                this.utils.call(`pause/${this.CLIENT_TOKEN}/${arguments[0]}?use_alias=${this.USE_ALIAS}`).then(() => {
                    return callback();
                }).catch((err) => { return callback(err); });
            });
        }

        /**
         * Start an alert from his ID
         * @param {String|Number} alertId
         * @callback
         * @returns {Promise}
         */
        startAlert() {
            return this.utils._handlePromises(arguments, 0, ({} = {}, callback) => {
                if (arguments.length !== 1) {
                    return callback(new Error("You must provide an alert ID!"));
                }

                this.utils.call(`start/${this.CLIENT_TOKEN}/${arguments[0]}?use_alias=${this.USE_ALIAS}`).then(() => {
                    return callback();
                }).catch((err) => { return callback(err); });
            });
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

                this._validateTokenPair(arguments[0]).then((pair) => {
                    this.utils.call(`start_all/${this.CLIENT_TOKEN}/${pair.token}/${pair.base}?use_alias=${this.USE_ALIAS}`).then(() => {
                        return callback();
                    }).catch((err) => { return callback(err); })
                }).catch((err) => { return callback(err); });
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

                this._validateTokenPair(arguments[0]).then((pair) => {
                    this.utils.call(`pause_all/${this.CLIENT_TOKEN}/${pair.token}/${pair.base}?use_alias=${this.USE_ALIAS}`).then(() => {
                        return callback();
                    }).catch((err) => { return callback(err); })
                }).catch((err) => { return callback(err); });
            });
        }

        /**
         * Add a token to your watchlist without any open position
         * @param pair Token pair (ie. STR/BTC)
         * @param exchange Name of the exchange (Blockfolio format, see getExchanges)
         * @callback
         */
        watchCoin(pair, exchange, callback) {
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
                this._validateTokenPair(arguments[0]).then((pair) => {
                    const doCall = () => {
                        this.utils.call(`lastprice/${exchange}/${pair.base}-${pair.token}?locale=${this.LOCALE}&use_alias=${this.USE_ALIAS}`,
                            (err, pBody) => {

                            if (err || typeof pBody.last === "undefined" || pBody.last <= 0) {
                                return callback(new Error("Unable to fetch last price !"));
                            }

                            return callback(null, pBody.last);
                        });
                    };

                    if (exchange === null) {
                        this.getExchanges(pair).then((exchanges) => {
                            exchange = exchanges[0];
                            doCall();
                        }).catch((err) => { return callback(err); });
                    } else {
                        doCall();
                    }
                }).catch((err) => { return callback(err); });
            });
        }

        /**
         * List Blockfolio announcements
         * @callback
         * @returns {Promise}
         */
        getAnnouncements() {
            return this.utils._handlePromises(arguments, 0, ({} = {}, callback) => {
                this.utils.call("announcements", { useSignalAPI: true }).then((pBody) => {
                    if (typeof pBody.announcements === "undefined") {
                        return callback(new Error("Unable to fetch announcements"));
                    }

                    return callback(null, pBody.announcements);
                }).catch((err) => { return callback(err); });
            });
        }

        /**
         * Get the version number of Blockfolio API
         * @callback
         * @returns {Promise}
         */
        getVersion() {
            return this.utils._handlePromises(arguments, 0, ({} = {}, callback) => {
                this.utils.call(`version?platform=${this.PLATFORM}`, (err, pBody) => {
                    if (err) { return callback(err); }

                    if (typeof pBody.version === "undefined") {
                        return callback(new Error("Unable to fetch version number"));
                    }

                    return callback(null, pBody.version);
                });
            });
        }

        /**
         * Retrieve a system status message if present
         * @param callback
         * @returns {Promise}
         */
        getStatus() {
            return this.utils._handlePromises(arguments, 0, ({} = {}, callback) => {
                this.utils.call(`system_status?platform=${this.PLATFORM}`, (err, pBody) => {
                    if (err) { return callback(err); }

                    if (typeof pBody.status === "undefined") {
                        return callback(new Error("Unable to fetch version number"));
                    }

                    return callback(null, pBody.status);
                });
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
                this._validateTokenPair(arguments[0]).then((pair) => {
                    this.utils.call(`exchangelist_v2/${pair.base}-${pair.token}`, (err, pBody) => {
                        if (err) { return callback(err); }

                        if (typeof pBody.exchange === "undefined" || pBody.exchange.length < 1) {
                            return callback(new Error("Unable to get available exchanges for this token !"));
                        }

                        return callback(null, pBody.exchange);
                    });
                }).catch((err) => { return callback(err); })
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

                this.utils.call(`get_all_positions/${this.CLIENT_TOKEN}?use_alias=${this.USE_ALIAS}&fiat_currency=${this.FIAT_CURRENCY}`, (err, pBody) => {
                    if (err) { return callback(err); }

                    if (typeof pBody.portfolio == "undefined") {
                        return callback(new Error("Bad response"));
                    }

                    return callback(null, pBody.portfolio);
                });

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
                    this.utils.call(`get_all_positions/${this.CLIENT_TOKEN}?use_alias=${this.USE_ALIAS}&fiat_currency=${this.FIAT_CURRENCY}`, (err, pBody) => {
                        if (err) { return callback(err); }

                        if (typeof pBody.positionList == "undefined") {
                            return callback(new Error("Bad response"));
                        }

                        return callback(null, pBody.positionList);
                    });
                } else {
                    this._validateTokenPair(arguments[0]).then((pair) => {
                        this.utils.call(`get_positions_v2/${this.CLIENT_TOKEN}/${pair.base}-${pair.token}?use_alias=${this.USE_ALIAS}&fiat_currency=${this.FIAT_CURRENCY}&locale=${this.LOCALE}`, (err, pBody) => {
                            if (err) { return callback(err); }

                            if (typeof pBody.positionList == "undefined") {
                                return callback(new Error("Bad response"));
                            }

                            return callback(null, pBody.positionList);
                        });
                    }).catch((err) => { return callback(err); });
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
                this.utils.call("currency", (err, pBody) => {
                    if (err) { return callback(err); }

                    if (typeof pBody.currencyList == "undefined") {
                        return callback(new Error("Bad response"));
                    }

                    return callback(null, pBody.currencyList);
                });
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

                this._validateTokenPair(arguments[0]).then((pair) => {
                    this.utils.call(`get_combined_position/${this.CLIENT_TOKEN}/${pair.base}-${pair.token}?use_alias=${this.USE_ALIAS}&fiat_currency=${this.FIAT_CURRENCY}&locale=${this.LOCALE}`, (err, pBody) => {
                        if (err) { return callback(err); }

                        if (typeof pBody.holdings == "undefined") {
                            return callback(new Error("Bad response"));
                        }

                        return callback(null, pBody.holdings);
                    });
                }).catch((err) => { return callback(err); })
            });
        }

        /**
         * Get the whole list of available coins on Blockfolio
         * @param callback
         * @returns {Promise}
         */
        getCoinsList(callback) {
            return this.utils._handlePromises(arguments, 0, ({} = {}, callback) => {
                this.utils.call("coinlist_v6", (err, pBody) => {
                    if (err) { return callback(err); }

                    if (typeof pBody.coins == "undefined") {
                        return callback(new Error("Bad response"));
                    }

                    return callback(null, pBody.coins);
                });
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

                this._validateTokenPair(arguments[0]).then((pair) => {
                    this.utils.call(`remove_all_positions/${this.CLIENT_TOKEN}/${pair.base}-${pair.token}?use_alias=${this.USE_ALIAS}`,
                        (err, pBody) => {
                            if (err) { return callback(err); }

                            return callback(null, pBody);
                        });
                }).catch((err) => { return callback(err); });
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
                    this.utils.call(`marketdetails_v2/${this.CLIENT_TOKEN}/${exchange}/${pair.base}-${pair.token}?use_alias=${this.USE_ALIAS}&locale=${this.LOCALE}&fiat_currency=${this.FIAT_CURRENCY}`, (err, pBody) => {
                        if (err) { return callback(err); }

                        return callback(null, pBody);
                    });
                };

                this._validateTokenPair(arguments[0]).then((pair) => {
                    if (exchange === null) {
                        this.getExchanges(pair).then((exchanges) => {
                            exchange = exchanges[0];
                            doCall(pair);
                        });
                    } else {
                        doCall(pair);
                    }
                }).catch((err) => { return callback(err); });
            });
        }

    }

    module.exports = Blockfolio;

})();