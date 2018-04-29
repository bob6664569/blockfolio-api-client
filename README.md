# blockfolio-api

[![Donate with Bitcoin](https://en.cryptobadges.io/badge/micro/1LhMTZWBnRq6NTwWegYKdMUAiH9LrWEvyd)](https://en.cryptobadges.io/donate/1LhMTZWBnRq6NTwWegYKdMUAiH9LrWEvyd) [![bitHound Overall Score](https://www.bithound.io/github/bob6664569/blockfolio-api-client/badges/score.svg)](https://www.bithound.io/github/bob6664569/blockfolio-api-client) [![bitHound Dependencies](https://www.bithound.io/github/bob6664569/blockfolio-api-client/badges/dependencies.svg)](https://www.bithound.io/github/bob6664569/blockfolio-api-client/master/dependencies/npm) [![bitHound Code](https://www.bithound.io/github/bob6664569/blockfolio-api-client/badges/code.svg)](https://www.bithound.io/github/bob6664569/blockfolio-api-client)

#### Non-official Node.JS API Client for Blockfolio

Install
--
```sh
npm install blockfolio-api-client --save
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
### addPosition(buy, pair, exchange, initPrice, amount, note, callback)

#### Add a new position to your portfolio.

**buy** (Boolean) : `TRUE` is buy, `FALSE` is sell

**pair** (String) : Token pair of the position (ie. `"XMR/BTC"`)

**exchange** (String) : Name of the exchange where the order is executed (see `getExchanges` to get the list of available exchanges for a specific token pair)

**initPrice** (Number) : Price of token pair when the order is executed (see `getPrice` to get the latest price for a specific token pair on a specific exchange)

**amount** (Number) : Quantity of order

**note** (String) : Note to add to the position in Blockfolio

**callback(err, result)** (Callback) : Function called when the response is received, `err` should be null if everything was fine, and `result` should contain `success` (otherwise, it will be the response body)

#### Example
```javascript
Blockfolio.addPosition(true, "XMR/BTC", "bittrex", 0.015, 42, "I really like Monero !", (err, res) => {
    if (err) throw(err);

    // 42 XMR from Bittrex added to your portfolio at the price of 0.015BTC each !
});
```

### watchCoin(pair, exchange, callback)

#### Add a coin to your portfolio without adding any position

**pair** (String) : Token pair of the position (ie. `"XMR/BTC"`)

**exchange** (String) : Name of the exchange where the order is executed (see `getExchanges` to get the list of available exchanges for a specific token pair)

**callback(err, result)** (Callback) : Function called when the response is received, `err` should be null if everything was fine, and `result` should contain `success` (otherwise, it will be the response body)

#### Example
```javascript
Blockfolio.watchCoin("XMR/BTC", "bittrex", (err, res) => {
    if (err) throw(err);

    // XMR from Bittrex added to your portfolio !
});
```

### getPrice(pair, exchange, callback)

#### Retrieve the last ticker price for specific token pair on specific exchange

**pair** (String) : Token pair of the position (ie. `"XMR/BTC"`)

**exchange** (String) : Name of the exchange where the order is executed (see `getExchanges` to get the list of available exchanges for a specific token pair)

**callback(err, price)** (Callback) : Function called when the response is received, `err` should be null if everything was fine, and `price` should return the last price (otherwise, it will be the response body)

#### Example
```javascript
Blockfolio.getPrice("XMR/BTC", "bittrex", (err, price) => {
    if (err) throw(err);

    console.log("Current price for XMR on Bittrex : " + price + "btc");
});
```

### getExchanges(pair, callback)

#### Returns a list of exchanges where the specified token pair is available

**pair** (String) : Token pair of the position (ie. `"XMR/BTC"`)

**callback(err, exchanges)** (Callback) : Function called when the response is received, `err` should be null if everything was fine, and `exchanges` should contain an array with the list of exchanges (otherwise, it will be the response body)

#### Example
```javascript
Blockfolio.getExchanges("XMR/BTC", (err, exchanges) => {
    if (err) throw(err);

    console.log("Top exchange for XMR/BTC is : " + exchanges[0]);
});
```

### getPositions(callback)

### removeCoin(pair, callback)

License
--
Distributed under the MIT License.
