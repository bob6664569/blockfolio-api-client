# blockfolio-api

[![Faire un don en Bitcoin](https://fr.cryptobadges.io/badge/micro/1LhMTZWBnRq6NTwWegYKdMUAiH9LrWEvyd)](https://fr.cryptobadges.io/donate/1LhMTZWBnRq6NTwWegYKdMUAiH9LrWEvyd)

Non-official Node.JS API Client for Blockfolio

Install
--
```sh
npm install blockfolio-api --save
```

Usage
--
```javascript
const blockfolio = require("blockfolio-api")("BLOCKFOLIO_DEVICE_TOKEN");

blockfolio.getPositions((err, positions) => {

    if (err) throw(err);

    console.log(positions);
});
```
