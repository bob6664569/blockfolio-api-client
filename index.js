/*jslint node: true, nomen: true, regexp: true, plusplus: true */
(function () {

    'use strict';

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

    const request = require('request');

    const PLATFORM = "android_rn";
    const API_URL =  "https://api-v0.blockfolio.com/rest/";
    const MAGIC_TOKEN = "edtopjhgn2345piuty89whqejfiobh89-2q453"; // Common token to pseudo-authenticate API Client
    const LOCALE = "en-US";

    class Blockfolio {

        constructor(clientToken = null, fiatCurrency = "usd") {
            this.CLIENT_TOKEN = clientToken;
            this.FIAT_CURRENCY = fiatCurrency;
        }

        _get(endpoint, callback) {
            request({
                method: "GET",
                url: API_URL + endpoint,
                headers: {
                    "magic": MAGIC_TOKEN
                }
            }, (err, result, body) => {
                try {
                    const tBody = JSON.parse(body);

                    return callback(null, tBody);
                } catch (e) {
                    // Exceptions for plain text responses
                    if (body === "success") return callback(null, body);
                    if (body === "fail") return callback(new Error("FAIL"));

                    return callback(e, body);
                }
            });
        }

        _checkToken() {
            // Maybe check a specific endpoint ?
            return (this.CLIENT_TOKEN !== null);
        }

        /**
         * Add a new position to the portfolio
         * @param buy Boolean Action of buy or sell
         * @param symbol Token pair symbol (ie. XRP/BTC)
         * @param exchange Name of the exchange (Blockfolio format, see getExchanges)
         * @param initPrice Initial price for the first transaction
         * @param amount Amount of token buy/sell
         * @param note Optional note
         * @param callback
         */
        addPosition(buy, pair, exchange, initPrice, amount, note = "", callback) {
            if (!this._checkToken()) return callback(new Error("A valid CLIENT_TOKEN should be provided"));

            // Prepare params
            const symbols = pair.split("/");
            const operation = buy ? 1 : 0;
            const URLEncodedNote = encodeURIComponent(note);
            const timestamp = new Date().getTime();

            // Fetch add
            this._get(`add_position_v2/${this.CLIENT_TOKEN}/${operation}/${symbols[0]}/${symbols[1]}/${exchange}/${initPrice}/${amount}/${timestamp}/0?platform=${PLATFORM}&note=${URLEncodedNote}&use_alias=true`, (err, pBody) => {
                if (err) return callback(err);

                return callback(null, pBody);
            });
        }

        /**
         * Add a token to your watchlist without any open position
         * @param pair Token pair (ie. STR/BTC)
         * @param exchange Name of the exchange (Blockfolio format, see getExchanges)
         * @param callback
         */
        watchCoin(pair, exchange, callback) {
            return this.addPosition(1, pair, exchange, 0, 0, "", callback);
        }

        /**
         * Get the last ticker price of selected token pair
         * @param pair Token pair (ie. ADA/BTC)
         * @param exchange Name of the exchange (Blockfolio format, see getExchanges)
         * @param callback
         */
        getPrice(pair, exchange, callback) {
            const symbols = pair.split("/").reverse().join("-");
            this._get(`lastprice/${exchange}/${symbols}?locale=${LOCALE}&use_alias=true`, (err, pBody) => {
                if (err) return callback(err);

                if(typeof pBody.last == "undefined" || pBody.last <= 0) {
                    return callback(new Error("Unable to fetch last price !"));
                }

                return callback(null, pBody.last);
            });
        }

        /**
         * Get available exchanges for selected pair
         * @param pair Token pair (ie. MMN/BTC)
         * @param callback
         */
        getExchanges(pair, callback) {
            const symbols = pair.split("/").reverse().join("-");
            this._get(`exchangelist_v2/${symbols}`, (err, pBody) => {
                if (err) return callback(err);

                if(typeof pBody.exchange == "undefined" || pBody.exchange.length < 1) {
                    return callback(new Error("Unable to get available exchanges for this token !"));
                }

                return callback(null, pBody.exchange);
            });
        }

        /**
         * Return all active user's positions
         * @param callback
         */
        getPositions(callback) {
            if (!this._checkToken()) return callback(new Error("A valid CLIENT_TOKEN should be provided"));

            this._get(`get_all_positions/${this.CLIENT_TOKEN}?use_alias=true&fiat_currency=${this.FIAT_CURRENCY}`, (err, pBody) => {
                if (err) return callback(err);

                if (typeof pBody.positionList == "undefined") return callback(new Error("Bad response"));

                return callback(null, pBody.positionList);
            });
        }

        /**
         * Remove the coin, and all transactions related
         * @param pair Token pair symbol (ie. LTC/BTC)
         * @param callback
         */
        removeCoin(pair, callback) {
            const symbols = pair.split("/").reverse().join("-");
            this._get(`remove_all_positions/${this.CLIENT_TOKEN}/${symbols}?use_alias=true`, (err, pBody) => {
                if (err) return callback(err);

                return callback(null, pBody);
            });
        }

    }

    module.exports = Blockfolio;

})();