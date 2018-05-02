/*jslint node: true, nomen: true, regexp: true, plusplus: true */
(function () {

    "use strict";

    const request = require("request");

    const signalEndpoints = ["announcements"];

    class BlockUtils {

        constructor(apiUrl, magicToken, signalApiUrl)
        {
            this.API_URL = apiUrl;
            this.MAGIC_TOKEN = magicToken;
            this.SIGNAL_API_URL = signalApiUrl;
        }

        /**
         * Make and return the call to the API
         * @param endpoint
         * @param callback
         * @private
         */
        call(endpoint, callback, method = "GET", body = null) {
            request({
                method: method,
                url: ((signalEndpoints.indexOf(endpoint) < 0) ? this.API_URL : this.SIGNAL_API_URL) + endpoint,
                headers: {
                    "magic": this.MAGIC_TOKEN
                },
                body: body
            }, (err, result, body) => {
                try {
                    const tBody = JSON.parse(body);

                    return callback(null, tBody);
                } catch (e) {
                    // Exceptions for plain text responses
                    if (body === "success") {
                        return callback(null, body);
                    } else if (body === "fail") {
                        return callback(new Error("FAIL"));
                    }

                    return callback(e, body);
                }
            });
        }

        /**
         * Parse and format a token pair
         * @param tokenStr String containing the token (ie. "XRP/BTC", "AEON", "USD-LTC", ...)
         * @returns {*} Structure with base & token values (default base is BTC)
         * @private
         */
        parseToken(tokenStr) {
            // Token is already parsed
            if (typeof tokenStr === "object") { return tokenStr; }

            // Check token format
            if (tokenStr.indexOf("/") > -1) { // Classic representation
                const [token, base] = tokenStr.split("/");
                return {base, token};
            } else if(tokenStr.indexOf("-") > -1) { // Inversed one
                const [base, token] = tokenStr.split("-");
                return {base, token};
            } else { // Raw token without attached base
                return {base: "BTC", token: tokenStr};
            }
        }

        /**
         * Create a new fake device to use with Blockfolio & return the Blockfolio instance
         * @callback
         * @private
         */
        generateClientToken() {
            return parseInt(Math.random().toString().substring(2)).toString(12);
        }
    }

    module.exports = BlockUtils;

})();