/*jslint node: true, nomen: true, regexp: true, plusplus: true */
(function () {

    'use strict';

    const   chai            = require('chai'),
            should          = chai.should();

    const   BlockfolioAPI   = require("../index");

    describe('Blockfolio API', () => {
        let Blockfolio;
        describe('Module Instanciation', () => {
            it('should be ok without currency', (done) => {
                try {
                    Blockfolio = new BlockfolioAPI("pouet");
                    done();
                } catch (e) {
                    done(e);
                }
            });
            it('should be ok with a currency', (done) => {
                try {
                    Blockfolio = new BlockfolioAPI("pouet", "eur");
                    done();
                } catch (e) {
                    done(e);
                }
            });
            it('should not be ok with an incorrect currency', (done) => {
                try {
                    const BFTest = new BlockfolioAPI("pouet", "zyx");
                    done(new Error("Instantiation passed"));
                } catch (e) {
                    done();
                }
            });
        });
    });


})();