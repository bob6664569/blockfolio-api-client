# blockfolio-api-client

[![Build Status](https://scrutinizer-ci.com/g/bob6664569/blockfolio-api-client/badges/build.png?b=master)](https://scrutinizer-ci.com/g/bob6664569/blockfolio-api-client/build-status/master)
[![Scrutinizer Code Quality](https://scrutinizer-ci.com/g/bob6664569/blockfolio-api-client/badges/quality-score.png?b=master)](https://scrutinizer-ci.com/g/bob6664569/blockfolio-api-client/?branch=master)
[![Code Coverage](https://scrutinizer-ci.com/g/bob6664569/blockfolio-api-client/badges/coverage.png?b=master)](https://scrutinizer-ci.com/g/bob6664569/blockfolio-api-client/?branch=master)
[![Known Vulnerabilities](https://snyk.io/test/github/bob6664569/blockfolio-api-client/badge.svg?targetFile=package.json)](https://snyk.io/test/github/bob6664569/blockfolio-api-client?targetFile=package.json)
[![npm](https://img.shields.io/npm/v/blockfolio-api-client.svg)](https://www.npmjs.com/package/blockfolio-api-client)
[![npm](https://img.shields.io/npm/dt/blockfolio-api-client.svg)](https://www.npmjs.com/package/blockfolio-api-client)

[![Donate with Bitcoin](https://en.cryptobadges.io/badge/micro/1LhMTZWBnRq6NTwWegYKdMUAiH9LrWEvyd)](https://en.cryptobadges.io/donate/1LhMTZWBnRq6NTwWegYKdMUAiH9LrWEvyd)
[![Donate with Litecoin](https://en.cryptobadges.io/badge/micro/LfCBBwQid43sbJ6Ta5uvJsbF5NijXrUsvy)](https://en.cryptobadges.io/donate/LfCBBwQid43sbJ6Ta5uvJsbF5NijXrUsvy)
[![Donate with Ethereum](https://en.cryptobadges.io/badge/micro/0x4c3e4ab76bef5bd75b9e02945bec46ba90332876)](https://en.cryptobadges.io/donate/0x4c3e4ab76bef5bd75b9e02945bec46ba90332876)

#### Non-official Node.JS API Client for Blockfolio

Disclaimer
----------

**Use with caution: Your `DEVICE_TOKEN` is used to access all your
Blockfolio datas, keep it safe and DON'T make it public.**

**This module is NOT provided by Blockfolio.**

Get the official Blockfolio app at [blockfolio.com](https://www.blockfolio.com/)

Installation
------------
```sh
npm install blockfolio-api-client --save
```

Usage
-----
 1. Require the module
 2. Call the `init` method with your `DEVICE_TOKEN`
 3. Once initialized, you can use the following doc and access to all
 your Blockfolio data !

#### Example
```javascript
const Blockfolio = require("blockfolio-api-client");

Blockfolio
    // Initialize the client with your DEVICE_TOKEN
    .init("BLOCKFOLIO_DEVICE_TOKEN")

    // Add a position of 42 XMR/BTC on the top exchange, at the current price
    .then(() => {
        return Blockfolio.addPosition("XMR/BTC", {
            amount: 42,
            note: "I love XMR!"
        });

    // Get the positions you got for XMR
    }).then(() => {
        return Blockfolio.getPositions({ pair: "XMR" });

    // Then remove the first one (last added)
    }).then((positions) => {
        console.log("I just added a position of XMR/BTC on the top exchange, there it is:");
        console.log(positions[0]);
        // Now delete this position:
        return Blockfolio.removePosition(positions[0].positionId);

    // TADA!
    }).then(() => {
        console.log("Position successfully removed!");
    }).catch((err) => {
        console.error(err);
    });
```

Methods
-------

- [addPosition](#addpositionbuy-pair-exchange-initprice-amount-note-callback)
- [watchCoin](#watchcoinpair-exchange-callback)
- [getPrice](#getpricepair-exchange-callback)
- [getExchanges](#getexchangespair-callback)
- [getPositions](#getpositionspair_or_callback-callback)
- [getHoldings](#getholdingspair-callback)
- [removeCoin](#removecoinpair-callback)
- [getMarketDetails](#getmarketdetailspair-exchange-callback)
- [getCoinsList](#getcoinslistcallback)
- [getCurrencies](#getcurrenciescallback)


### addPosition(pair\[, options, callback\])

**Add a new position to your portfolio.**

- **pair** (String or Pair Object) : Token pair of the position (ie. `"XMR/BTC"`)
- **options** : if no option is provided, then the coin is just added to the watchlist
  - **mode** (String - default: "sell") : `buy` or `sell`
  - **exchange** (String - default to the top exchange) : Name of the exchange where the order is executed (see [`getExchanges`](#getexchangespair-callback) to get the list of available exchanges for a specific token pair)
  - **initPrice** (Number - default to last price) : Price of token pair when the order is executed (see `getPrice` to get the latest price for a specific token pair on a specific exchange)
  - **amount** (Number - default 0) : Quantity of tokens in the position
  - **note** (String - default empty) : Note to add to the position in Blockfolio
- **callback(err, result)** (Callback) : Function called when the response is received, `err` should be null if everything was fine, and `result` should contain `success` (otherwise, it will be the response body) - you can also use directly the result as a Promise

#### Example
```javascript
Blockfolio.addPosition("XMR/BTC", {
    mode: "buy",
    exchange: "bittrex",
    amount: 42,
    note: "I really like Monero !"}).then(() => {
    console.log("42 XMR successfully added to your Blockfolio at the current price from Bittrex!"
}).catch((err) => { console.error(err); });
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

### getCurrencies(callback)

**Get the whole list of supported currencies**

**callback(err, currencies)** (Callback) : Function called when the response is received, `err` should be null if everything was fine, and `currencies` should contain an array of currencies objects (otherwise, it will be the response body)

#### Example
```javascript
Blockfolio.getCurrencies((err, currencies) => {
    if (err) throw(err);

    currencies.forEach(currency => {
        console.log(`${currency.fullName} (${currency.symbol}) is abbreviated ${currency.currency}.`);
    });
});
```

License
-------
Distributed under the MIT License.
