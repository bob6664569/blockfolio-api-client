# blockfolio-api

[![Donate with Bitcoin](https://en.cryptobadges.io/badge/micro/1LhMTZWBnRq6NTwWegYKdMUAiH9LrWEvyd)](https://en.cryptobadges.io/donate/1LhMTZWBnRq6NTwWegYKdMUAiH9LrWEvyd) [![bitHound Overall Score](https://www.bithound.io/github/bob6664569/blockfolio-api-client/badges/score.svg)](https://www.bithound.io/github/bob6664569/blockfolio-api-client) [![bitHound Dependencies](https://www.bithound.io/github/bob6664569/blockfolio-api-client/badges/dependencies.svg)](https://www.bithound.io/github/bob6664569/blockfolio-api-client/master/dependencies/npm) [![bitHound Code](https://www.bithound.io/github/bob6664569/blockfolio-api-client/badges/code.svg)](https://www.bithound.io/github/bob6664569/blockfolio-api-client)

Non-official Node.JS API Client for Blockfolio

Install
--
```sh
npm install blockfolio-api --save
```

Usage
--
```javascript
const BlockfolioAPI = require("blockfolio-api");

// BLOCKFOLIO_DEVICE_TOKEN is found under the "Settings" part of the app, in the bottom of the page
// The currency specified on second parameter is optional (default to "usd")
const Blockfolio = new BlockfolioAPI("BLOCKFOLIO_DEVICE_TOKEN", "eur");

Blockfolio.getPositions((err, positions) => {

    if (err) throw(err);

    console.log(positions);
});
```

Methods
-------
### addPosition(buy, pair, exchange, initPrice, amount, note = "", callback)

### watchCoin(pair, exchange, callback)

### getPrice(pair, exchange, callback) {

### getExchanges(pair, callback)

### getPositions(callback)

### removeCoin(pair, callback)

License
--
Distributed under the MIT License.
