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
npm install blockfolio-api-client@beta --save
```

Finding your `DEVICE_TOKEN`
---------------------------

The `DEVICE_TOKEN` used to be found under the `Settings` menu until
version `1.1.14` of Blockfolio, since `1.1.15`, only a *disposable* one
is displayed on the app.

If you want to find out what is your real `DEVICE_TOKEN`, you have
several ways to do it, but we will only document here the easiest one :

### Downgrading Blockfolio

**Once you get your `DEVICE_TOKEN` using this method, you may then go
back to the latest version without any issue, enjoy!**

#### For Android

You need to allow 3rd parties packages / Installation outside the Play
Store, then install an old version directly from the APK.

Then you can easily find sources for the old official APK on the Internet (ie.
[APK4FUN](https://www.apk4fun.com/link/263867/a/),
[APK.Plus](https://apk.plus/download/com.blockfolio.blockfolio/33d0332717386308ed86e4dbff7e7b41/),
and many others...)

Just remove your current version, download the `1.1.14` and install it
on your device. You should now see your real `DEVICE_TOKEN` and start to
play with the API!

#### For iPhones

If you installed Blockfolio before the 1.1.5 update, you can find the
previous version using iTunes.

Go to the `Music` > `iTunes` > `iTunes Media` > `Mobile Applications`
folder on your drive, then you should find a folder called
`Previous Mobile Applications`. Find the `1.1.14` version of
Blockfolio, and drag and drop it onto iTunes. Delete the app from your
phone, and resync with iTunes. You should be back to 1.1.14 version,
congratulations !

Usage
-----
 1. Require the module
 2. Call the `init` method with your `DEVICE_TOKEN`
 3. Once initialized, you can use the following doc and access to all
 your Blockfolio data !

Examples
--------

##### Add a position, fetch it then remove it (Promises-style)

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

#### Get the list of your global holdings (old callback-style)
```javascript
const Blockfolio = require("blockfolio-api-client");

Blockfolio

    // Initialize the client with your DEVICE_TOKEN (disableCoinCheck to skip coins sync)
    .init("BLOCKFOLIO_DEVICE_TOKEN", { disableCoinCheck: true }, (err) => {
        if (err) { return console.error(err); }

        // Call getPositions with only a callback to fetch all global positions
        Blockfolio.getPositions((err, positions) => {
            if (err) { return console.error(err); }

            // Display list of current positions
            positions.forEach((position) => {
                console.log(`Got ${position.quantity} ${position.coin} for a total BTC value of ${position.holdingValueBtc}.`);
            });
        });
    });
```

Methods
-------

- **Miscellaneous**
  - [getCoinsList](#getcoinslistcallback) : Get the list of all coins available on Blockfolio
  - [getCurrencies](#getcurrenciescallback) : Get the list of available currencies
  - [getAnnouncements](#getannouncements) : Get announcements from the Signal API
  - [getStatus](#getstatus) : Get the system status of the API
- **Positions**
  - [getPositions](#getpositionspair_or_callback-callback) : Get a summary of all your positions
  - [addPosition](#addpositionbuy-pair-exchange-initprice-amount-note-callback) : Add a position (many possibilities)
  - [removePosition](#addpositionbuy-pair-exchange-initprice-amount-note-callback) : Remove a specific position
  - [watchCoin](#watchcoinpair-exchange-callback) : Just add a pair to watch on your portfolio
  - [removeCoin](#removecoinpair-callback) : Remove completely a pair from your list
  - [getHoldings](#getholdingspair-callback) : Get holdings info for a specific coin
- **Exchanges & Markets**
  - [getPrice](#getpricepair-exchange-callback) : Get the price of a coin (you can specify an exchange)
  - [getExchanges](#getexchangespair-callback) : Get the list of exchanges for a specific coin
  - [getMarketDetails](#getmarketdetailspair-exchange-callback) : Get informations about the current market of a coin
- **Alerts**
  - [addAlert](#addalertspair-options_or_callback-callback) : Add an price alert for a coin
  - [removeAlert](#removealertalertid) : Remove a specific alert
  - [getAlerts](#getalertspair-callback) : Get the list of set up alerts for a coin
  - [pauseAlert](#getalertspair-callback) : Pause a specific alert
  - [startAlert](#getalertspair-callback) : Restart a specific alert
  - [pauseAllAlerts](#getalertspair-callback) : Pause all alerts on a coin
  - [startAllAlerts](#getalertspair-callback) : Restart all alerts on a coin


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
    note: "I really like Monero !"
}).then(() => {
    console.log("42 XMR successfully added to your Blockfolio at the current price from Bittrex!"
}).catch((err) => { 
    console.error(err);
});
```

### watchCoin(pair[, options, callback])

**Add a coin to your portfolio without adding any position**

- **pair** (String) : Token pair of the position (ie. `"XMR/BTC"`)
- **options** : if no option is provided, then the coin is just added to the watchlist on the top exchange
  - **exchange** (String - default to the top exchange) : Name of the exchange where the order is executed (see [`getExchanges`](#getexchangespair-callback) to get the list of available exchanges for a specific token pair)
- **callback(err, result)** (Callback) : Function called when the response is received, `err` should be null if everything was fine, and `result` should contain `success` (otherwise, it will be the response body)

#### Example
```javascript
Blockfolio.watchCoin("XMR/BTC", { exchange: "bittrex" }).then(() => {
    // XMR from Bittrex added to your portfolio !
}).catch((err) => { 
  console.error(err);
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
