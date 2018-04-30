/*jslint node: true, nomen: true, regexp: true, plusplus: true */
(function () {

    'use strict';

    const   chai            = require("chai"),
            expect          = chai.expect;

    const   BlockfolioAPI   = require("../index");


    const FAKE_TOKEN = "1915f3d2ef313e86";

    describe("Blockfolio API", function() {
        let Blockfolio;
        describe("Module Instanciation", () => {
            it("should be ok without currency", (done) => {
                try {
                    Blockfolio = new BlockfolioAPI(FAKE_TOKEN);
                    done();
                } catch (e) {
                    done(e);
                }
            });
            it("should be ok with a currency", (done) => {
                try {
                    Blockfolio = new BlockfolioAPI(FAKE_TOKEN, "eur");
                    done();
                } catch (e) {
                    done(e);
                }
            });
        });
        describe("Tools", () => {
            it("should convert properly XRP/BTC to a pair struct", (done) => {
                const pair = BlockfolioAPI.parseToken("XRP/BTC");
                expect(pair).to.be.deep.equal({base: "BTC", token: "XRP"});
                done();
            });
            it("should convert properly BTC/USD to a pair struct", (done) => {
                const pair = BlockfolioAPI.parseToken("BTC/USD");
                expect(pair).to.be.deep.equal({base: "USD", token: "BTC"});
                done();
            });
            it("should convert properly AEON to a pair struct", (done) => {
                const pair = BlockfolioAPI.parseToken("AEON");
                expect(pair).to.be.deep.equal({base: "BTC", token: "AEON"});
                done();
            });
            it("should convert properly BTC-LTC to a pair struct", (done) => {
                const pair = BlockfolioAPI.parseToken("BTC-LTC");
                expect(pair).to.be.deep.equal({base: "BTC", token: "LTC"});
                done();
            });
        });
        describe("Endpoints tests", function () {
            // Expand timeout for network & API lentency
            this.timeout(5000);
            let exchange;
            it("Get available exchanges for AEON/BTC", (done) => {
                Blockfolio.getExchanges("AEON/BTC", (err, exchanges) => {
                    if (err) return done(err);

                    expect(exchanges).to.be.an("array");
                    exchange = exchanges[0];
                    done();
                });
            });
            it("Get available exchanges for an incorrect token", (done) => {
                Blockfolio.getExchanges("ZSKJD/BTC", (err, exchanges) => {
                    expect(err.message).to.exist;
                    expect(err.message).to.equal("Unable to get available exchanges for this token !");
                    expect(exchanges).to.not.exist;
                    done();
                });
            });
            it("Add a token pair to watch from the first exchange", (done) => {
                Blockfolio.watchCoin("AEON/BTC", exchange, (err, res) => {
                    if (err) return done(err);

                    expect(res).to.equal("success");
                    done();
                });
            });
            let price = 0;
            it("Get the last price of AEON on this exchange", (done) => {
                Blockfolio.getPrice("AEON/BTC", exchange, (err, rPrice) => {
                    if (err) return done(err);

                    expect(rPrice).to.be.a("number");
                    price = rPrice;
                    done();
                });
            });
            it("Get the last price of an incorrect token on this exchange", (done) => {
                Blockfolio.getPrice("EAZRREZREZ/BTC", exchange, (err, rPrice) => {
                    expect(err.message).to.exist;
                    expect(err.message).to.equal("Unable to fetch last price !");
                    expect(rPrice).to.not.exist;
                    done();
                });
            });
            it("Add a BTC position on this pair", (done) => {
                Blockfolio.addPosition(true, "AEON/BTC", exchange, 0.00018, 200, "AEON FTW", (err, res) => {
                    if (err) return done(err);

                    expect(res).to.equal("success");
                    done();
                });
            });
            it("And then remove the coin from portfolio", (done) => {
                Blockfolio.removeCoin("AEON/BTC", (err, res) => {
                    if (err) return done(err);

                    expect(res).to.equal("success");
                    done();
                });
            });
            it("Get actual positions", (done) => {
                Blockfolio.getPositions((err, positions) => {
                    if (err) return done(err);

                    expect(positions).to.exist;
                    done();
                });
            });
        });
    });


})();