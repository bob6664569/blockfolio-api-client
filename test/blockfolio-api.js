/*jslint node: true, nomen: true, regexp: true, plusplus: true */
(function () {

    'use strict';

    const   chai            = require("chai"),
            should          = chai.should(),
            expect          = chai.expect;

    const   Blockfolio      = require("../index");

    const   FAKE_TOKEN      = "1915f3d2ef313e86";

    describe("Blockfolio API", function() {
        describe("General", function () {
            it("Get the API version", function (done) {
                Blockfolio.getVersion((err, version) => {
                    if (err) { return done(err); }
                    should.exist(version);
                    expect(version).to.be.a("number");
                    return done();
                });
            });
            it("Get the system status of the API", function (done) {
                Blockfolio.getStatus((err, statusMsg) => {
                    if (err) { return done(err); }
                    should.exist(statusMsg);
                    expect(statusMsg).to.be.a("string");
                    return done();
                });
            });
            it("Get the announcements from SIGNAL", function (done) {
                Blockfolio.getAnnouncements((err, announcements) => {
                    if (err) { return done(err); }
                    should.exist(announcements);
                    expect(announcements).to.be.an("array");
                    return done();
                });
            });
            it("should fail at registering an already activated DEVICE_TOKEN", function (done) {
                Blockfolio._register(FAKE_TOKEN, (err, response) => {
                    should.exist(err.message);
                    should.not.exist(response);
                    return done();
                });
            });
        });
        describe("Module Instanciation", function () {
            it("a protected method called without it should return an error", function (done) {
                Blockfolio.getPositions("BTC/USD", (err, positions) => {
                    should.exist(err.message);
                    expect(err.message).to.equal("A valid CLIENT_TOKEN should be provided! (Have you called Blockfolio.init()?)");
                    should.not.exist(positions);
                    return done();
                });
            });
            // Expand timeout for initialization
            this.timeout(5000);
            it("should be ok with a working token", function (done) {
                try {
                    Blockfolio.init(FAKE_TOKEN, (err) => {
                        if (err) { return done(err); }

                        return done();
                    });
                } catch (e) {
                    return done(e);
                }
            });
        });
        describe("Tools", function () {
            it("should return a random token", function (done) {
                const generatedToken = Blockfolio.utils.generateClientToken();
                expect(generatedToken).to.be.a("string");
                return done();
            });
            it("should convert properly XRP/BTC to a pair struct", function (done) {
                const pair = Blockfolio.utils.parseToken("XRP/BTC");
                expect(pair).to.be.deep.equal({base: "BTC", token: "XRP"});
                return done();
            });
            it("should convert properly BTC/USD to a pair struct", function (done) {
                const pair = Blockfolio.utils.parseToken("BTC/USD");
                expect(pair).to.be.deep.equal({base: "USD", token: "BTC"});
                return done();
            });
            it("should convert properly AEON to a pair struct", function (done) {
                const pair = Blockfolio.utils.parseToken("AEON");
                expect(pair).to.be.deep.equal({base: "BTC", token: "AEON"});
                return done();
            });
            it("should convert properly BTC-LTC to a pair struct", function (done) {
                const pair = Blockfolio.utils.parseToken("BTC-LTC");
                expect(pair).to.be.deep.equal({base: "BTC", token: "LTC"});
                return done();
            });
        });
        describe("Endpoints", function () {
            // Expand timeout for network & API lentency
            this.timeout(10000);
            it("Get the currencies list", function (done) {
                Blockfolio.getCurrencies((err, currencies) => {
                    if (err) { return done(err); }
                    should.exist(currencies);
                    expect(currencies).to.be.an("array");
                    return done();
                });
            });
            it("Get the coins list", function (done) {
                Blockfolio.getCoinsList((err, coins) => {
                    if (err) { return done(err); }
                    should.exist(coins);
                    expect(coins).to.be.an("array");
                    return done();
                });
            });
            it("Get a Disposable Device Token", function (done) {
                Blockfolio.getDisposableDeviceToken(token => {
                   should.exist(token);
                   return done();
                });
            });
            it("Get market details for an AEON/BTC", function (done) {
                Blockfolio.getMarketDetails("AEON/BTC", "bittrex", (err, details) => {
                    if (err) { return done(err); }

                    should.exist(details.ask);
                    expect(details.ask).to.be.a("string");
                    return done();
                });
            });
            it("Get available exchanges for this token", function (done) {
                Blockfolio.getExchanges("AEON/BTC", (err, exchanges) => {
                    if (err) { return done(err); }

                    expect(exchanges).to.be.an("array");
                    return done();
                });
            });
            it("Get available exchanges for an incorrect token", function (done) {
                Blockfolio.getExchanges("ZSKJD/BTC", (err, exchanges) => {
                    should.exist(err.message);
                    expect(err.message).to.equal("ZSKJD is not an available token on Blockfolio!");
                    should.not.exist(exchanges);
                    return done();
                });
            });
            it("Add a token pair to watch from Bittrex", function (done) {
                Blockfolio.watchCoin("AEON/BTC", "bittrex", (err, res) => {
                    if (err) { return done(err); }

                    expect(res).to.equal("success");
                    return done();
                });
            });
            it("Get the last price of an incorrect token on this exchange", function (done) {
                Blockfolio.getPrice("EAZRREZREZ/BTC", "bittrex", (err, rPrice) => {
                    should.exist(err.message);
                    expect(err.message).to.equal("EAZRREZREZ is not an available token on Blockfolio!");
                    should.not.exist(rPrice);
                    return done();
                });
            });


            it("... and with a valid token, but an incorrect base", function (done) {
                Blockfolio.getPrice("BTC/DSQFSDFDSF", "bittrex", (err, nPrice) => {
                    should.exist(err.message);
                    expect(err.message).to.equal("BTC is not an available in DSQFSDFDSF on Blockfolio!");
                    return done();
                });
            });


            it("Get the last price of AEON on this exchange", function (done) {
                Blockfolio.getPrice("AEON/BTC", "bittrex", (err, cPrice) => {
                    if (err) { return done(err); }

                    expect(cPrice).to.be.a("number");
                    return done();
                });
            });
            it("Add a BTC position on this pair", function (done) {
                Blockfolio.addPosition(true, "AEON/BTC", "bittrex", 0.00018, 200, "AEON FTW", (err, res) => {
                    if (err) { return done(err); }

                    expect(res).to.equal("success");
                    return done();
                });
            });
            it("Get the summary for current position", function (done) {
                Blockfolio.getHoldings("AEON/BTC", (err, summary) => {
                    if (err) { return done(err); }

                    should.exist(summary.holdingValueString);
                    expect(summary.holdingValueString).to.be.a("string");
                    return done();
                });
            });
            it("Get orders details for this position", function (done) {
                Blockfolio.getPositions("AEON/BTC", (err, positions) => {
                    if (err) { return done(err); }

                    should.exist(positions);
                    expect(positions).to.be.an("array");
                    return done();
                });
            });
            it("And then remove the coin from portfolio", function (done) {
                Blockfolio.removeCoin("AEON/BTC", (err, res) => {
                    if (err) { return done(err); }

                    expect(res).to.equal("success");
                    return done();
                });
            });
            it("Get actual positions", function (done) {
                Blockfolio.getPositions((err, positions) => {
                    if (err) { return done(err); }

                    should.exist(positions);
                    expect(positions).to.be.an("array");
                    return done();
                });
            });
        });
    });

})();