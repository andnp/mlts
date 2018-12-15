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
const tfUtil = require("utils/tensorflow");
const cifar = require("data/gray_cifar10");
const TwoStageDictionaryLearning_1 = require("algorithms/TwoStageDictionaryLearning");
const classification_1 = require("analysis/classification");
const csv_1 = require("utils/csv");
const iterations = 20000;
function execute() {
    return __awaiter(this, void 0, void 0, function* () {
        yield csv_1.testLoad('.tmp/cifar10.csv');
        process.exit(0);
        const dataset = tfUtil.oneHotDataset(yield cifar.load());
        console.log('loaded dataset');
        const transposed = tfUtil.transposeDataset(dataset);
        console.log('transposed dataset');
        const [X, Y] = transposed.train;
        const [T, TY] = transposed.test;
        const samples = X.shape[1];
        const features = X.shape[0];
        const classes = Y.shape[0];
        const t_samples = T.shape[1];
        const hidden = 2;
        console.log('Samples:', samples, 'Features:', features, 'Classes:', classes); // tslint:disable-line no-console
        const tsdl = new TwoStageDictionaryLearning_1.TwoStageDictionaryLearning(features, classes, hidden, samples, {
            stage1: {
                regD: 0.01,
            }
        });
        tsdl.train(X, Y, {
            iterations,
        });
        const TY_hat = tsdl.predict(T, { iterations });
        const Y_hat = tsdl.predict(X, { iterations });
        const trainError = classification_1.getClassificationError(Y_hat.transpose(), Y.transpose());
        const testError = classification_1.getClassificationError(TY_hat.transpose(), TY.transpose());
        console.log('test:', testError.get(), 'train:', trainError.get());
    });
}
execute()
    .then(() => process.exit(0))
    .catch(e => console.log('uncaught error', e)); // tslint:disable-line no-console
//# sourceMappingURL=index.js.map