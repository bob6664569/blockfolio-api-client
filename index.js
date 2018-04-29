/*jslint node: true, nomen: true, regexp: true, plusplus: true */
(function () {

    'use strict';

    /**
     *
     * Blockfolio API Endpoints
     *
     * /register/{e}?platform={platform}
     * /lastprice/{e}/{base}-{tokenSymbol}?locale={_}&use_alias=true
     * /coinlist_v6
     * /get_all_positions/{token}?fiat_currency={r}&locale={_}&use_alias=true
     * /exchangelist_v2/{base}-{tokenSymbol}
     * /currency
     * /news?{e}
     * /updateUserExchange?token={n}&coin={tokenSymbol}&base={base}&exchange={g(t)}
     * /news_sources
     * /updateUserCoinToken?token={t}{e}
     * /add_position_v2/{token}/1/{tokenSymbol}/{base}/{n}/{price}/{quantity}/{r}/{watch}/?platform={platform}&note={o}&use_alias=true
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

    const API_URL =  "https://api-v0.blockfolio.com/rest/";
    const MAGIC_TOKEN = "edtopjhgn2345piuty89whqejfiobh89-2q453"; // Common token to pseudo-authenticate API Client

    class Blockfolio {

        constructor(clientToken, fiatCurrency = "usd") {
            this.CLIENT_TOKEN = clientToken;
            this.FIAT_CURRENCY = fiatCurrency;
        }

        _get(endpoint, callback) {
            request({
                method: "GET",
                url: API_URL + endpoint + "/",
                headers: { "magic": MAGIC_TOKEN }
            }, (err, result, body) => {
                try {
                    const tBody = JSON.parse(body);
                    return callback(null, tBody);
                } catch (e) {
                    return callback(e);
                }
            });
        }

        _post(endpoint, data, callback) {
            request({
                method: "POST",
                url: API_URL + endpointy,
                headers: { "magic": MAGIC_TOKEN },
                postData: {
                    mimeType: 'application/x-www-form-urlencoded',
                    params: data
                }
            }, (err, result, body) => {
                try {
                    const tBody = JSON.parse(body);
                    return callback(null, tBody);
                } catch (e) {
                    return callback(e);
                }
            });
        }

        getPositions(callback) {
            this._get(`get_all_positions/{this.CLIENT_TOKEN}?use_alias=true&fiat_currency={this.FIAT_CURRENCY}`, (err, pBody) => {
                if (err) return callback(err);

                if (typeof pBody.positionList == "undefined") return callback(new Error("Bad response"));

                return callback(err, pBody.positionList);
            });
        }

    }

    module.exports = Blockfolio;

})();