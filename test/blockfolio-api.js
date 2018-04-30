/*jslint node: true, nomen: true, regexp: true, plusplus: true */
(function () {

    'use strict';

    const   chai            = require("chai"),
            should          = chai.should(),
            expect          = chai.expect;

    const   Blockfolio   = require("../index");


    const FAKE_TOKEN = "1915f3d2ef313e86";

    describe("Blockfolio API", function() {
        describe("Module Instanciation", function () {
            // Expand timeout for initialization
            this.timeout(5000);
            it("should be ok with a working token", (done) => {
                try {
                    Blockfolio.init(FAKE_TOKEN, (err) => {
                        if (err) return done(err);

                        done();
                    });
                } catch (e) {
                    done(e);
                }
            });
        });
        describe("Tools", () => {
            it("should convert properly XRP/BTC to a pair struct", (done) => {
                const pair = Blockfolio.utils.parseToken("XRP/BTC");
                expect(pair).to.be.deep.equal({base: "BTC", token: "XRP"});
                done();
            });
            it("should convert properly BTC/USD to a pair struct", (done) => {
                const pair = Blockfolio.utils.parseToken("BTC/USD");
                expect(pair).to.be.deep.equal({base: "USD", token: "BTC"});
                done();
            });
            it("should convert properly AEON to a pair struct", (done) => {
                const pair = Blockfolio.utils.parseToken("AEON");
                expect(pair).to.be.deep.equal({base: "BTC", token: "AEON"});
                done();
            });
            it("should convert properly BTC-LTC to a pair struct", (done) => {
                const pair = Blockfolio.utils.parseToken("BTC-LTC");
                expect(pair).to.be.deep.equal({base: "BTC", token: "LTC"});
                done();
            });
        });
        describe("Endpoints tests", function () {
            // Expand timeout for network & API lentency
            this.timeout(5000);
            it("Get market details for an AEON/BTC", (done) => {
                Blockfolio.getMarketDetails("AEON/BTC", "bittrex", (err, details) => {
                    if (err) return done(err);

                    should.exist(details.ask);
                    expect(details.ask).to.be.a("string");
                    done();
                });
            });
            let exchange;
            it("Get available exchanges for this token", (done) => {
                Blockfolio.getExchanges("AEON/BTC", (err, exchanges) => {
                    if (err) return done(err);

                    expect(exchanges).to.be.an("array");
                    exchange = exchanges[0];
                    done();
                });
            });
            it("Get available exchanges for an incorrect token", (done) => {
                Blockfolio.getExchanges("ZSKJD/BTC", (err, exchanges) => {
                    should.exist(err.message);
                    expect(err.message).to.equal("Unable to get available exchanges for this token !");
                    should.not.exist(exchanges);
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
                    should.exist(err.message);
                    expect(err.message).to.equal("Unable to fetch last price !");
                    should.not.exist(rPrice);
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
            it("Get the summary for current position", (done) => {
                Blockfolio.getHoldings("AEON/BTC", (err, summary) => {
                    if (err) return done(err);

                    should.exist(summary.holdingValueString);
                    expect(summary.holdingValueString).to.be.a("string");
                    done();
                });
            });
            it("Get orders details for this position", (done) => {
                Blockfolio.getPositions("AEON/BTC", (err, positions) => {
                    if (err) return done(err);

                    should.exist(positions);
                    expect(positions).to.be.an("array");
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

                    should.exist(positions);
                    expect(positions).to.be.an("array");
                    done();
                });
            });
        });
    });


})();