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

**Use with caution: Your `DEVICE_TOKEN` is used to access all your**
**Blockfolio datas, keep it safe and DON'T make it public.**

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

**Once you get your `DEVICE_TOKEN` using this method, you may then go**
**back to the latest version without any issue, enjoy!**

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

#### Add a position, fetch it then remove it (Promises-style)

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

Every client's methods could be called with an ending *error-first callback*. In that case, the first parameter of the callback must be `null` if everything was fine, and returns the result in second parameter. If the method doesn't succeed, than the first parameter will contain the returned error, and the second will be populated with the raw body of the API's reponse.

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

Documentation
-------------

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

### Miscellaneous

#### getCoinsList(\[callback\])

##### Synopsis

Get the whole list of coins supported by Blockfolio

##### Returns



##### Example

```javascript
Blockfolio.getCoinsList().then((coins) => {
    console.log(coins);
}).catch((err) => { console.error(err); });
```

#### getCurrencies(\[callback\])

##### Synopsis

Get the whole list of supported currencies.

##### Example
```javascript
Blockfolio.getCurrencies().then((currencies) => {
    currencies.forEach(currency => {
        console.log(`${currency.fullName} (${currency.symbol}) is abbreviated ${currency.currency}.`);
    });
}).catch((err) => { console.error(err); });
```

#### getAnnouncements(\[callback\])

##### Synopsis

Get the last announcements from the new Signal API. Announcements that you receive depends on the coins you own on your portfolio.

##### Example

```javascript
Blockfolio.getAnnouncements().then((announcements) => {
    console.log(announcements);
}).catch((err) => { console.error(err); });
```

#### getStatus(\[callback\])

##### Synopsis

Get an status message from Blockfolio. Without any issues, this message is empty.

##### Example

```javascript
Blockfolio.getStatus().then((status) => {
    console.log(status);
}).catch((err) => { console.error(err); });
```

### Positions

#### getPositions(\[pair, callback\])

##### Synopsis

Return a summary of all the positions in Blockfolio

If no pair is provided, then all position summaries are returned. If a token pair is passed, then the detailed positions regarding this specific pair are returned.

##### Arguments

- **pair** (String) : Token pair of the positions (ie. `"XMR/BTC"`)

##### Examples

```javascript
Blockfolio.getPositions().then((positions) => {
    positions.forEach((pos) => {
        console.log(`I HODL ${pos.quantity} ${pos.coin}/${pos.base} for a value of ${pos.holdingValueFiat} ${pos.fiatSymbol}`);
    });
}).catch((err) => { console.error(err); });
```

OR

```javascript
Blockfolio.getPositions("BTC/USD").then((positions) => {
    // positions contains all the orders saved on Blockfolio in "BTC/USD"
    positions.forEach((pos) => {
        // Do something with each position taken
    });
}).catch((err) => { console.error(err); });
```

#### removePosition(positionId[, callback\])

##### Synopsis

Add a new position to your portfolio.

##### Arguments

- **positionId** (String or Number) : ID of the position to remove

##### Example
```javascript
Blockfolio.removePosition(42).then((() => {
    console.log("Your position #42 has been successfuly removed!"
}).catch((err) => { console.error(err); });
```

#### watchCoin(pair\[, options, callback\])

##### Synopsis

Add a coin to your portfolio without adding any position

##### Arguments

- **pair** (String) : Token pair of the coin to watch (ie. `"XMR/BTC"`)
- **options** : if no option is provided, then the coin is just added to the watchlist on the top exchange
  - **exchange** (String - default to the top exchange) : Name of the exchange where the order is executed (see [`getExchanges`](#getexchangespair-callback) to get the list of available exchanges for a specific token pair)

##### Example
```javascript
Blockfolio.watchCoin("XMR/BTC", { exchange: "bittrex" }).then(() => {
    // XMR from Bittrex added to your portfolio !
}).catch((err) => { console.error(err); });
```

#### removeCoin(pair\[, callback\])

##### Synopsis

Completely remove a coin from your portfolio

##### Arguments

- **pair** (String) : Token pair to remove from the portfolio (ie. `"XMR/BTC"`)

##### Example
```javascript
Blockfolio.removeCoin("XMR/BTC").then(() => {
    // XMR/BTC is now removed from your portfolio !
}).catch((err) => { 
    // XMR/BTC could not be removed from your portfolio
});
```

#### getHoldings(pair\[, callback\])

##### Synopsis

Get the summary of all opened positions on specified token pair

##### Arguments

- **pair** (String) : Token pair (ie. `"XMR/BTC"`)

##### Example

```javascript
Blockfolio.getHoldings("XMR/BTC").then((holdings) => {
    console.log(holdings);
}).catch((err) => { console.error(err); });
```

### Markets & Exchanges

#### getPrice(pair\[, options, callback\])

##### Synopsis

Retrieve the last ticker price for specific token pair on specific exchange

##### Arguments

- **pair** (String) : Token pair (ie. `"XMR/BTC"`)
- **options** : if no option is provided, then the price is returned from the top exchange
  - **exchange** (String - default to the top exchange) : Name of the exchange where the price should be retrieved (see [`getExchanges`](#getexchangespair-callback) to get the list of available exchanges for a specific token pair)

##### Example

```javascript
Blockfolio.getPrice("XMR/BTC", { exchange: "bittrex" }).then((price) => {
    console.log("Current price for XMR on Bittrex : " + price + "btc");
}).catch((err) => { console.error(err); });
```

#### getExchanges(pair\[, callback\])

##### Synopsis

Returns a list of exchanges where the specified token pair is available

##### Arguments

- **pair** (String) : Token pair (ie. `"XMR/BTC"`)

##### Returns

List of available exchanges for this coin.

##### Example

```javascript
Blockfolio.getExchanges("XMR/BTC").then((exchanges) => {
    console.log("Top exchange for XMR/BTC is : " + exchanges[0]);
}).catch((err) => { console.error(err); });
```

#### getMarketDetails(pair[, options, callback])

##### Synopsis

Get informations on the current market for specified token pair on specified exchange

##### Arguments

- **pair** (String) : Token pair to get market details from (ie. `"XMR/BTC"`)
- **options** : if no option is provided, then the market on the top exchange is returned
  - **exchange** (String - default to the top exchange) : Name of the exchange where from which you want to get market details (see [`getExchanges`](#getexchangespair-callback) to get the list of available exchanges for a specific token pair)

##### Returns

Details of the selected market

##### Example
```javascript
Blockfolio.getMarketDetails("XMR/BTC", { exchange: "bittrex"}).then((details) => {
    console.log(details);
}).catch((err) => { console.error(err); });
```

### Alerts

#### addAlert(pair, options[, callback])

##### Synopsis

Add an price alert for a coin.

##### Arguments

- **pair** (String) : Token pair to get set the alert (ie. `"XMR/BTC"`)
- **options** : You need to provide at least **under** or **above** option to set an alert
  - **exchange** (String - default to the top exchange) : Name of the exchange used to trigger the alert (see [`getExchanges`](#getexchangespair-callback) to get the list of available exchanges for a specific token pair)
  - **above** (Number) : Top boundary to trigger the alert
  - **under** (Number) : Bottom boundary to trigger the alert
  - **persistant** (Boolean) : Set to `true`, the alert will be triggered each time the price crosses a boundary

##### Example

```javascript
Blockfolio.addAlert("XMR/BTC", { 
    exchange: "bittrex",
    above: 0.03
}).then(() => {
    // Alert successfuly set !
}).catch((err) => { console.error(err); });
```

#### removeAlert(alertID[, callback])

##### Synopsis

Removes an existing alert from your portfolio.

##### Arguments

- **alertId** (Number) : ID of the alert to be removed

##### Examples

```javascript
Blockfolio.removeAlert(42).then(() => {
    // Alert successfuly removed !
}).catch((err) => { console.error(err); });
```

#### getAlerts(pair[, callback])

##### Synopsis

Retrieve the list of current alerts set for a coin

##### Arguments

- **pair** (String) : Token pair to get set the alert (ie. `"XMR/BTC"`)

##### Example

```javascript

```

#### pauseAlert(alertId[, callback])

##### Synopsis

Pause the specified alert to block it from sending notifications temporarily.

##### Arguments

- **alertID** (Number) : ID of the existing alert to pause

Example

```javascript

```

#### startAlert(alertId[, callback])

##### Synopsis

Restart the specified alert to allow it to send notifications again.

##### Arguments

- **alertID** (Number) : ID of the existing alert to restart

Example

```javascript

```

#### pauseAllAlerts([callback])

##### Synopsis

Pause all alerts and block then from sending notifications temporarily.

##### Example

```javascript

```

#### startAlert([callback])

##### Synopsis

Restart all alerts to allow them to send notifications again.

##### Example

```javascript

```



Author
------

**Johan Massin**  - [bob6664569](https://github.com/bob6664569)

See also the list of (contributors)[https://github.com/bob6664569/blockfolio-api-client/graphs/contributors] who participated in this project.

License
-------
Distributed under the MIT License.
