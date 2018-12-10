"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const analysis_1 = require("../analysis");
const utilities_ts_1 = require("utilities-ts");
const Algorithm_1 = require("../algorithms/Algorithm");
const Experiment_1 = require("./Experiment");
class ClassificationErrorExperiment extends Experiment_1.Experiment {
    async _run(obs) {
        const alg = this.description.algorithm;
        const d = this.description.dataset;
        if (!(alg instanceof Algorithm_1.SupervisedAlgorithm))
            throw new Error('Can only work with supervised algorithms');
        const [X, Y] = d.train;
        const history = await alg.train(X, Y, this.description.optimization);
        const [T, TY] = d.test;
        const Y_hat = await alg.predict(X, this.description.optimization);
        const TY_hat = await alg.predict(T, this.description.optimization);
        const trainError = analysis_1.getClassificationError(Y_hat, Y).get();
        const testError = analysis_1.getClassificationError(TY_hat, TY).get();
        const params = alg.getParameters();
        const resultsPath = this.description.path;
        obs.next({
            tag: 'test',
            type: 'txt',
            path: `${resultsPath}/test.csv`,
            data: testError,
        });
        obs.next({
            tag: 'train',
            type: 'txt',
            path: `${resultsPath}/train.csv`,
            data: trainError,
        });
        obs.next({
            tag: 'params',
            type: 'json',
            path: `${resultsPath}/params.json`,
            data: params,
        });
        obs.next({
            tag: 'experiment',
            type: 'json',
            path: `${resultsPath}/experiment.json`,
            data: this.description.definition,
        });
        const loss = utilities_ts_1.Matrix.fromData([history.loss]);
        obs.next({
            tag: 'loss',
            type: 'csv',
            path: `${resultsPath}/loss.csv`,
            data: loss,
        });
    }
}
exports.ClassificationErrorExperiment = ClassificationErrorExperiment;
//# sourceMappingURL=ClassificationError.js.map