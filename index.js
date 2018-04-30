/*jslint node: true, nomen: true, regexp: true, plusplus: true */
(function () {

    "use strict";

    const   Blockfolio      = require("./lib/blockfolio");

    const   PLATFORM      = "APIClient",
            API_URL       = "https://api-v0.blockfolio.com/rest/",
            MAGIC_TOKEN   = "edtopjhgn2345piuty89whqejfiobh89-2q453", // Common token to pseudo-authenticate API Client
            LOCALE        = "en-US",
            FIAT_CURRENCY = "usd";

    module.exports = new Blockfolio(FIAT_CURRENCY, API_URL, MAGIC_TOKEN, LOCALE, PLATFORM);

})();