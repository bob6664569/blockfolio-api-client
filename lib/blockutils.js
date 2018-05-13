/*jslint node: true, nomen: true, regexp: true, plusplus: true */
(function () {

    "use strict";

    const   request     = require("request"),
            RateLimiter = require("limiter").RateLimiter;

    class BlockUtils {

        constructor(apiUrl, magicToken, signalApiUrl)
        {
            this.API_URL = apiUrl;
            this.MAGIC_TOKEN = magicToken;
            this.SIGNAL_API_URL = signalApiUrl;
            this.limiter = new RateLimiter(3, 'second');
        }

        /**
         * Allow to use callback-style methods with promises
         * @param {Array}       args            Original function arguments
         * @param {Number}      optionsOffset   Expected offset of the options object in the arguments
         * @callback
         * @private
         */
        _handlePromises(args, optionsOffset, callback) {
            let fCallback = args[args.length - 1];
            const checkArgsAndGo = (options = {}) => {
                if (args[optionsOffset] !== fCallback) {
                    options = args[optionsOffset];
                }
                callback(options, fCallback);
            };
            if (typeof fCallback === "function") {
                return checkArgsAndGo();
            }
            return new Promise((resolve, reject) => {
                fCallback = (err, res) => {
                    if (err) { return reject(err); }
                    return resolve(res);
                };
                checkArgsAndGo();
            });
        }

        /**
         * Make and return the call to the API
         * @param endpoint
         * @param callback
         * @private
         */
        call() {
            return this._handlePromises(arguments, 1, ({
                useSignalAPI = false,
                method = "GET",
                body = null
            } = {}, callback) => {
                this.limiter.removeTokens(1, () => {
                    request({
                        method: method,
                        url: ((useSignalAPI) ? this.SIGNAL_API_URL : this.API_URL) + arguments[0],
                        headers: {"magic": this.MAGIC_TOKEN},
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
                });
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