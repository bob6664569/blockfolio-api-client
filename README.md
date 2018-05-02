# blockfolio-api

[![Donate with Bitcoin](https://en.cryptobadges.io/badge/micro/1LhMTZWBnRq6NTwWegYKdMUAiH9LrWEvyd)](https://en.cryptobadges.io/donate/1LhMTZWBnRq6NTwWegYKdMUAiH9LrWEvyd) [![Donate with Litecoin](https://en.cryptobadges.io/badge/micro/LfCBBwQid43sbJ6Ta5uvJsbF5NijXrUsvy)](https://en.cryptobadges.io/donate/LfCBBwQid43sbJ6Ta5uvJsbF5NijXrUsvy) [![Donate with Ethereum](https://en.cryptobadges.io/badge/micro/0x4c3e4ab76bef5bd75b9e02945bec46ba90332876)](https://en.cryptobadges.io/donate/0x4c3e4ab76bef5bd75b9e02945bec46ba90332876)

[![npm](https://img.shields.io/npm/dt/blockfolio-api-client.svg)](https://www.npmjs.com/package/blockfolio-api-client) [![bitHound Overall Score](https://www.bithound.io/github/bob6664569/blockfolio-api-client/badges/score.svg)](https://www.bithound.io/github/bob6664569/blockfolio-api-client) [![bitHound Dependencies](https://www.bithound.io/github/bob6664569/blockfolio-api-client/badges/dependencies.svg)](https://www.bithound.io/github/bob6664569/blockfolio-api-client/master/dependencies/npm) [![bitHound Code](https://www.bithound.io/github/bob6664569/blockfolio-api-client/badges/code.svg)](https://www.bithound.io/github/bob6664569/blockfolio-api-client)

#### Non-official Node.JS API Client for Blockfolio

Disclaimer
----------

**Use with caution: Your `DEVICE_TOKEN` is used to access all your
Blockfolio datas, keep it safe and DON'T make it public.**

**This module is NOT provided by Blockfolio.**

Get the official Blockfolio app at [blockfolio.com](https://www.blockfolio.com/)

Install
-------
```sh
npm install blockfolio-api-client --save
```

Usage
-----
 1. Require the module
 2. Call the `init` method with your `DEVICE_TOKEN` (you will find your
 token on the Blockfolio app, in the bottom of the `Settings` page)
 3. Once initialized, you can use the following doc and access to all
 your Blockfolio data !

```javascript
const Blockfolio = require("blockfolio-api-client");

Blockfolio.init("BLOCKFOLIO_DEVICE_TOKEN", (err) => {
    if (err) return console.error(err);

    // Use any of the following methods to play with your Blockfolio datas, here : getPositions
    Blockfolio.getPositions((err, positions) => {
        if (err) return console.error(err);

        console.log(positions);
    });

});
```

Methods
-------
### addPosition(buy, pair, exchange, initPrice, amount, note, callback)

**Add a new position to your portfolio.**

**buy** (Boolean) : `TRUE` is buy, `FALSE` is sell

**pair** (String) : Token pair of the position (ie. `"XMR/BTC"`)

**exchange** (String) : Name of the exchange where the order is executed (see [`getExchanges`](#getexchangespair-callback) to get the list of available exchanges for a specific token pair)

**initPrice** (Number) : Price of token pair when the order is executed (see `getPrice` to get the latest price for a specific token pair on a specific exchange)

**amount** (Number) : Quantity of tokens in the order

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

**Add a coin to your portfolio without adding any position**

**pair** (String) : Token pair of the position (ie. `"XMR/BTC"`)

**exchange** (String) : Name of the exchange where the order is executed (see [`getExchanges`](#getexchangespair-callback) to get the list of available exchanges for a specific token pair)

**callback(err, result)** (Callback) : Function called when the response is received, `err` should be null if everything was fine, and `result` should contain `success` (otherwise, it will be the response body)

#### Example
```javascript
Blockfolio.watchCoin("XMR/BTC", "bittrex", (err, res) => {
    if (err) throw(err);

    // XMR from Bittrex added to your portfolio !
});
```

### getPrice(pair, exchange, callback)

**Retrieve the last ticker price for specific token pair on specific exchange**

**pair** (String) : Token pair of the position (ie. `"XMR/BTC"`)

**exchange** (String) : Name of the exchange where the order is executed (see [`getExchanges`](#getexchangespair-callback) to get the list of available exchanges for a specific token pair)

**callback(err, price)** (Callback) : Function called when the response is received, `err` should be null if everything was fine, and `price` should return the last price (otherwise, it will be the response body)

#### Example
```javascript
Blockfolio.getPrice("XMR/BTC", "bittrex", (err, price) => {
    if (err) throw(err);

    console.log("Current price for XMR on Bittrex : " + price + "btc");
});
```

### getExchanges(pair, callback)

**Returns a list of exchanges where the specified token pair is available**

**pair** (String) : Token pair of the position (ie. `"XMR/BTC"`)

**callback(err, exchanges)** (Callback) : Function called when the response is received, `err` should be null if everything was fine, and `exchanges` should contain an array with the list of exchanges (otherwise, it will be the response body)

#### Example
```javascript
Blockfolio.getExchanges("XMR/BTC", (err, exchanges) => {
    if (err) throw(err);

    console.log("Top exchange for XMR/BTC is : " + exchanges[0]);
});
```

### getPositions(pair_or_callback[, callback])

**Return a summary of all the positions in Blockfolio**

First param could be directly the callback, in this case, all position summaries are returned. If the first parameter is a token pair, then the detailed positions regarding this specific pair are returned.

**pair** (String) : Token pair of the position (ie. `"XMR/BTC"`)

**callback(err, positions)** (Callback) : Function called when the response is received, `err` should be null if everything was fine, and `positions` should contain an array with all the position summaries, or detailed for specific token (otherwise, it will be the response body)

#### Examples
```javascript
Blockfolio.getPositions((err, positions) => {
    if (err) throw(err);

    positions.forEach((pos) => {
        console.log(`I HODL ${pos.quantity} ${pos.coin}/${pos.base} for a value of ${pos.holdingValueFiat} ${pos.fiatSymbol}`);
    });
});

Blockfolio.getPositions("BTC/USD", (err, positions) => {
    if (err) throw(err);

    // positions contains all the orders saved on Blockfolio in "BTC/USD"
    positions.forEach((pos) => {
        // Do something with each position taken
    });
});
```

### getHoldings(pair, callback)

**Get the summary of all opened positions on specified token pair**

**pair** (String) : Token pair of the position (ie. `"XMR/BTC"`)

**callback(err, summary)** (Callback) : Function called when the response is received, `err` should be null if everything was fine, and `holdings` should contain an object with the summarized informations on current positions on specified token pair (otherwise, it will be the response body)

```javascript
Blockfolio.getHoldings("XMR/BTC", (err, holdings) => {
    if (err) throw(err);

    console.log(holdings);
});
```

### removeCoin(pair, callback)

**Completely remove a coin from your portfolio**

**pair** (String) : Token pair to remove from the portfolio (ie. `"XMR/BTC"`)

**callback(err, response)** (Callback) : Function called when the response is received, `err` should be null if everything was fine, and `response` should contain `success` (otherwise, it will be the response body)

#### Example
```javascript
Blockfolio.removeCoin("XMR/BTC", (err, res) => {
    if (err) throw(err);

    // XMR/BTC is now removed from your portfolio !
});
```


### getMarketDetails(pair, exchange, callback)

#### Get informations on the current market for specified token pair on specified exchange

**pair** (String) : Token pair to remove from the portfolio (ie. `"XMR/BTC"`)

**exchange** (String) : Name of the exchange where the order is executed (see [`getExchanges`](#getexchangespair-callback) to get the list of available exchanges for a specific token pair)

**callback(err, response)** (Callback) : Function called when the response is received, `err` should be null if everything was fine, and `response` should contain the details (otherwise, it will be the response body)

#### Example
```javascript
Blockfolio.getMarketDetails("XMR/BTC", "bittrex", (err, details) => {
    if (err) throw(err);

    console.log(details);
});
```

### getCoinsList(callback)

**Get the whole list of coins supported by Blockfolio**

**callback(err, coins)** (Callback) : Function called when the response is received, `err` should be null if everything was fine, and `coins` should contain an array of coins (otherwise, it will be the response body)

#### Example
```javascript
Blockfolio.getCoinsList((err, coins) => {
    if (err) throw(err);

    console.log(coins);
});
```

License
-------
Distributed under the MIT License.
