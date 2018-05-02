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
            this.coins = [];
        }

        /**
         * Initiialization of own datas
         * @callback
         */
        init(clientToken, callback) {
            // TODO: Add options
            this.CLIENT_TOKEN = clientToken;
            this._refreshCoins((err) => {
                if (err) { return callback(err); }

                // TODO: Check available exchanges too
                return callback(null);
            });
        }

        /**
         * Register for a new device token on Blockfolio
         * @param clientToken
         * @callback
         * @private
         */
        _register(clientToken, callback) {
            this.utils.call(`register/${clientToken}?platform=${this.PLATFORM}`, (err, response) => {
                if (err) { return callback(err); }

                if (response === "success") {
                    return callback();
                } else {
                    return callback(new Error("Unable to create new device token !"));
                }
            });
        }

        /**
         * Refresh internal list of coins
         * @callback
         * @private
         */
        _refreshCoins(callback) {
            this.getCoinsList((err, coins) => {
                if (err) { return callback(err); }
                this.coins = {};

                const fCoins = this._groupCoinsByName(coins);

                for (const key in fCoins) {
                    if (fCoins.hasOwnProperty(key)) {
                        const coin = fCoins[key];
                        const alias = this._getMostUsedAlias(coin);
                        delete coin.aliases;

                        this.coins[alias] = coin;
                    }
                }

                callback(null);
            });
        }

        /**
         * @param {{fullName:string,base:string,aliasTokenSymbol:string}[]} coins Coins array
         * @private
         */
        _groupCoinsByName(coins) {
            const fCoins = {};

            coins.forEach((coin) => {
                if (typeof fCoins[coin.fullName] == "undefined") {
                    fCoins[coin.fullName] = {
                        name: coin.fullName,
                        aliases: [coin.aliasTokenSymbol],
                        bases: [coin.base]
                    };
                } else {
                    fCoins[coin.fullName].bases.push(coin.base);
                    fCoins[coin.fullName].aliases.push(coin.aliasTokenSymbol);
                }
            });

            return fCoins;
        }

        /**
         * @param {{aliases:string[]}} coin Coins array grouped by name
         * @private
         */
        _getMostUsedAlias(coin) {
            let alias = null;
            let countAlias = {};

            coin.aliases.forEach((nAlias) => {
                countAlias[nAlias] = countAlias[nAlias] || 0;
                countAlias[nAlias]++;
                if (!alias || countAlias[nAlias] > countAlias[alias]) {
                    alias = nAlias;
                }
            });

            return alias;
        }

        /**
         * Blockfolio introduced the concept of "Disposable Device Token" in latest builds to block the API Client,
         * this is how to get it with a proper CLIENT_TOKEN set...
         * @callback
         */
        getDisposableDeviceToken(callback) {
            this.utils.call(`device/${this.CLIENT_TOKEN}`, (err, pBody) => {
                return callback(pBody);
            }, "POST", JSON.stringify({token: this.CLIENT_TOKEN}));
        }

        /**
         * Check validity of a client token
         * @returns {boolean}
         * @private
         */
        _checkClientToken() {
            // TODO: Maybe check a specific endpoint for the validity of the token / store it ?
            return (this.CLIENT_TOKEN !== null);
        }

        /**
         * Checkif the required token pair exists in local list, else, replace it with a new one
         * @param pair
         * @callback
         * @private
         */
        _validateTokenPair(pair, callback) {
            pair = this.utils.parseToken(pair);

            if (typeof this.coins[pair.token] === "undefined") {
                return callback(new Error(`${pair.token} is not an available token on Blockfolio!`));
            }

            if (this.coins[pair.token].bases.indexOf(pair.base) < 0) {
                return callback(new Error(`${pair.token} is not an available in ${pair.base} on Blockfolio!`),
                    { base: this.coins[pair.token].bases[0], token: pair.token });
            }

            return callback(null, pair);
        }

        /**
         * Add a new position to the portfolio
         * @param {Boolean} buy Action of buy or sell
         * @param pair Token pair symbol (ie. XRP/BTC)
         * @param exchange Name of the exchange (Blockfolio format, see getExchanges)
         * @param initPrice Initial price for the first transaction
         * @param amount Amount of token buy/sell
         * @param note Optional note
         * @callback
         */
        addPosition(buy, pair, exchange, initPrice, amount, note, callback) {
            if (!this._checkClientToken()) {
                return callback(new Error("A valid CLIENT_TOKEN should be provided! (Have you called Blockfolio.init()?)"));
            }

            // Prepare params
            const operation = buy ? 1 : -1;
            const URLEncodedNote = encodeURIComponent(note);
            const timestamp = new Date().getTime();

            this._validateTokenPair(pair, (err, pair) => {
                if (err) { return callback(err); }

                // Fetch add
                this.utils.call(`add_position_v2/${this.CLIENT_TOKEN}/${operation}/${pair.token}/${pair.base}/${exchange}/${initPrice}/${amount}/${timestamp}/0?platform=${this.PLATFORM}&note=${URLEncodedNote}&use_alias=true`, (err, pBody) => {
                    if (err) { return callback(err); }

                    return callback(null, pBody);
                });
            });
        }

        /**
         * Add a token to your watchlist without any open position
         * @param pair Token pair (ie. STR/BTC)
         * @param exchange Name of the exchange (Blockfolio format, see getExchanges)
         * @callback
         */
        watchCoin(pair, exchange, callback) {
            return this.addPosition(1, pair, exchange, 0, 0, "", callback);
        }

        /**
         * Get the last ticker price of selected token pair
         * @param pair Token pair (ie. ADA/BTC)
         * @param exchange Name of the exchange (Blockfolio format, see getExchanges)
         * @callback
         */
        getPrice(pair, exchange, callback) {
            this._validateTokenPair(pair, (err, pair) => {
                if (err) { return callback(err); }

                exchange = exchange.toLowerCase();
                this.utils.call(`lastprice/${exchange}/${pair.base}-${pair.token}?locale=${this.LOCALE}&use_alias=true`,
                    (err, pBody) => {

                        if (err || typeof pBody.last === "undefined" || pBody.last <= 0) {
                            return callback(new Error("Unable to fetch last price !"));
                        }

                        return callback(null, pBody.last);
                    });
            });
        }

        /**
         * List Blockfolio announcements
         * @callback
         */
        getAnnouncements(callback) {
            this.utils.call("announcements", (err, pBody) => {
                if (err) { return callback(err); }

                if (typeof pBody.announcements === "undefined") {
                    return callback(new Error("Unable to fetch announcements"));
                }

                return callback(null, pBody.announcements);
            });
        }

        /**
         * Get the version number of Blockfolio API
         * @callback
         */
        getVersion(callback) {
            this.utils.call(`version?platform=${this.PLATFORM}`, (err, pBody) => {
                if (err) { return callback(err); }

                if (typeof pBody.version === "undefined") {
                    return callback(new Error("Unable to fetch version number"));
                }

                return callback(null, pBody.version);
            });
        }

        /**
         * Retrieve a system status message if present
         * @param callback
         */
        getStatus(callback) {
            this.utils.call(`system_status?platform=${this.PLATFORM}`, (err, pBody) => {
                if (err) { return callback(err); }

                if(typeof pBody.status === "undefined") {
                    return callback(new Error("Unable to fetch version number"));
                }

                return callback(null, pBody.status);
            });
        }

        /**
         * Get available exchanges for selected pair
         * @param pair Token pair (ie. MMN/BTC)
         * @callback
         */
        getExchanges(pair, callback) {
            this._validateTokenPair(pair, (err, pair) => {
                if (err) { return callback(err); }

                this.utils.call(`exchangelist_v2/${pair.base}-${pair.token}`, (err, pBody) => {
                    if (err) { return callback(err); }

                    if (typeof pBody.exchange === "undefined" || pBody.exchange.length < 1) {
                        return callback(new Error("Unable to get available exchanges for this token !"));
                    }

                    return callback(null, pBody.exchange);
                });
            });
        }

        /**
         * Return all active user's positions
         * @param pair Token pair symbol (ie. "ADA/BTC"), or @callback directly
         * @callback Optionnal if given as first argument
         */
        getPositions(pair, callback = null) {
            if (!this._checkClientToken()) {
                return callback(new Error("A valid CLIENT_TOKEN should be provided! (Have you called Blockfolio.init()?)"));
            }

            if (typeof pair === "function") {
                callback = pair;
                this.utils.call(`get_all_positions/${this.CLIENT_TOKEN}?use_alias=true&fiat_currency=${this.FIAT_CURRENCY}`, (err, pBody) => {
                    if (err) { return callback(err); }

                    if (typeof pBody.positionList == "undefined") {
                        return callback(new Error("Bad response"));
                    }

                    return callback(null, pBody.positionList);
                });
            } else {
                this._validateTokenPair(pair, (err, pair) => {
                    if (err) { return callback(err); }

                    this.utils.call(`get_positions_v2/${this.CLIENT_TOKEN}/${pair.base}-${pair.token}?use_alias=true&fiat_currency=${this.FIAT_CURRENCY}&locale=${this.LOCALE}`, (err, pBody) => {
                        if (err) { return callback(err); }

                        if (typeof pBody.positionList == "undefined") {
                            return callback(new Error("Bad response"));
                        }

                        return callback(null, pBody.positionList);
                    });
                });
            }
        }

        /**
         * List the available currencies on the app
         * @callback
         */
        getCurrencies(callback) {
            this.utils.call("currency", (err, pBody) => {
                if (err) { return callback(err); }

                if (typeof pBody.currencyList == "undefined") {
                    return callback(new Error("Bad response"));
                }

                return callback(null, pBody.currencyList);
            });
        }

        /**
         * Get summary of all positions regarding the specified token
         * @param pair Token pair symbol (ie. "XLM/BTC")
         * @param callback
         */
        getHoldings(pair, callback) {
            if (!this._checkClientToken()) {
                return callback(new Error("A valid CLIENT_TOKEN should be provided! (Have you called Blockfolio.init()?)"));
            }

            this._validateTokenPair(pair, (err, pair) => {
                if (err) { return callback(err); }

                this.utils.call(`get_combined_position/${this.CLIENT_TOKEN}/${pair.base}-${pair.token}?use_alias=true&fiat_currency=${this.FIAT_CURRENCY}&locale=${this.LOCALE}`, (err, pBody) => {
                    if (err) { return callback(err); }

                    if (typeof pBody.holdings == "undefined") {
                        return callback(new Error("Bad response"));
                    }

                    return callback(null, pBody.holdings);
                });
            });
        }

        /**
         * Get the whole list of available coins on Blockfolio
         * @param callback
         */
        getCoinsList(callback) {
            this.utils.call("coinlist_v6", (err, pBody) => {
                if (err) { return callback(err); }

                if (typeof pBody.coins == "undefined") {
                    return callback(new Error("Bad response"));
                }

                return callback(null, pBody.coins);
            });
        }

        /**
         * Remove the coin, and all transactions related
         * @param pair Token pair symbol (ie. "LTC/BTC")
         * @callback
         */
        removeCoin(pair, callback) {
            if (!this._checkClientToken()) {
                return callback(new Error("A valid CLIENT_TOKEN should be provided! (Have you called Blockfolio.init()?)"));
            }

            this._validateTokenPair(pair, (err, pair) => {
                if (err) { return callback(err); }

                this.utils.call(`remove_all_positions/${this.CLIENT_TOKEN}/${pair.base}-${pair.token}?use_alias=true`,
                    (err, pBody) => {
                        if (err) { return callback(err); }

                        return callback(null, pBody);
                    });
            });
        }

        /**
         * Retrieve market infos from Blockfolio for this pair on specified exchange
         * @param pair Token Pair (ie. "BYTE/BTC")
         * @param exchange Name of the exchange (Blockfolio format, see getExchanges)
         * @callback
         */
        getMarketDetails(pair, exchange, callback) {
            if (!this._checkClientToken()) {
                return callback(new Error("A valid CLIENT_TOKEN should be provided! (Have you called Blockfolio.init()?)"));
            }

            this._validateTokenPair(pair, (err, pair) => {
                if (err) { return callback(err); }

                this.utils.call(`marketdetails_v2/${this.CLIENT_TOKEN}/${exchange}/${pair.base}-${pair.token}?use_alias=true&locale=${this.LOCALE}&fiat_currency=${this.FIAT_CURRENCY}`, (err, pBody) => {
                    if (err) { return callback(err); }

                    return callback(null, pBody);
                });
            });
        }

    }

    module.exports = Blockfolio;

})();