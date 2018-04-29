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
        describe("Endpoints tests", function () {
            // Expand timeout for network & API lentency
            this.timeout(5000);
            let exchange;
            it("Get available exchanges for AEON/BTC", (done) => {
                Blockfolio.getExchanges("AEON/BTC", (err, exchanges) => {
                    if (err) done(err);

                    expect(exchanges).to.be.an("array");
                    exchange = exchanges[0];
                    done();
                });
            });
            it("Add a token pair to watch from the first exchange", (done) => {
                Blockfolio.watchCoin("AEON/BTC", exchange, (err, res) => {
                    if (err) done(err);

                    expect(res).to.equal("success");
                    done();
                });
            });
            let price = 0;
            it("Get the last price of AEON on this exchange", (done) => {
                Blockfolio.getPrice("AEON/BTC", exchange, (err, rPrice) => {
                    if (err) done(err);

                    expect(rPrice).to.be.an("number");
                    price = rPrice;
                    done();
                });
            });
            it("Add a BTC position on this pair", (done) => {
                Blockfolio.addPosition(true, "AEON/BTC", exchange, 0.00018, 200, "AEON FTW", (err, res) => {
                    if (err) done(err);

                    expect(res).to.equal("success");
                    done();
                });
            });
            it("And then remove the coin from portfolio", (done) => {
                Blockfolio.removeCoin("AEON/BTC", (err, res) => {
                    if (err) done(err);

                    expect(res).to.equal("success");
                    done();
                });
            });
            it("Get actual positions", (done) => {
                Blockfolio.getPositions((err, positions) => {
                    if (err) done(err);

                    expect(positions).to.exist;
                    done();
                });
            });
        });
    });


})();