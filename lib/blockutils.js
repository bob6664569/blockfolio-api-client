/*jslint node: true, nomen: true, regexp: true, plusplus: true */
(function () {

    "use strict";

    const request = require('request');

    class BlockUtils {

        constructor(api_url, magic_token)
        {
            this.API_URL = api_url;
            this.MAGIC_TOKEN = magic_token;
        }

        /**
         * Make and return the call to the API
         * @param endpoint
         * @param callback
         * @private
         */
        call(endpoint, callback) {
            request({
                method: "GET",
                url: this.API_URL + endpoint,
                headers: {
                    "magic": this.MAGIC_TOKEN
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

        /**
         * Parse and format a token pair
         * @param tokenStr String containing the token (ie. "XRP/BTC", "AEON", "USD-LTC", ...)
         * @returns {*} Structure with base & token values (default base is BTC)
         * @private
         */
        parseToken(tokenStr) {
            if (tokenStr.indexOf("/") > -1) { // Classic representation
                const [token, base] = tokenStr.split("/");
                return {base, token};
            } else if(tokenStr.indexOf("-") > -1) { // Inversed one
                const [base, token] = tokenStr.split("-");
                return {base, token};
            } else {
                return {base: "BTC", token: tokenStr};
            }
        }
    }

    module.exports = BlockUtils;

})();