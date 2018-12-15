"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
require("@tensorflow/tfjs-node");
const path = require("path");
const TwoStageDictionaryLearning_1 = require("algorithms/TwoStageDictionaryLearning");
const csv_1 = require("utils/csv");
const downloader_1 = require("utils/downloader");
const iterations = 10000;
const dataRemoteLocation = 'https://rawgit.com/andnp/ml_data/master/deterding.tar.gz';
const dataLocation = 'tmp';
function execute() {
    return __awaiter(this, void 0, void 0, function* () {
        yield downloader_1.download(dataRemoteLocation, dataLocation);
        const X_dat = yield csv_1.loadCsv(path.join(dataLocation, 'deterding/deterding_X.csv'));
        const Y_dat = yield csv_1.loadCsv(path.join(dataLocation, 'deterding/deterding_Y.csv'));
        const T_dat = yield csv_1.loadCsv(path.join(dataLocation, 'deterding/deterding_T.csv'));
        const samples = X_dat.cols;
        const features = X_dat.rows;
        const classes = Y_dat.rows;
        const t_samples = T_dat.cols;
        const hidden = 2;
        console.log('Samples:', samples, 'Features:', features, 'Classes:', classes); // tslint:disable-line no-console
        const tsdl = new TwoStageDictionaryLearning_1.TwoStageDictionaryLearning(features, classes, hidden, samples);
        tsdl.train(X_dat, Y_dat, {
            iterations,
        });
        const Y_hat = yield tsdl.predict(T_dat, { iterations });
        console.log(Y_hat); // tslint:disable-line no-console
    });
}
execute().catch(e => console.log('uncaught error', e));
//# sourceMappingURL=experiment.js.map