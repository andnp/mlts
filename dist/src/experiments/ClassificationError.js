"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const analysis_1 = require("../analysis");
const Algorithm_1 = require("../algorithms/Algorithm");
const Experiment_1 = require("./Experiment");
class ClassificationErrorExperiment extends Experiment_1.Experiment {
    async _run(obs) {
        const alg = this.description.algorithm;
        const d = this.description.dataset;
        if (!(alg instanceof Algorithm_1.SupervisedAlgorithm))
            throw new Error('Can only work with supervised algorithms');
        const [X, Y] = d.train;
        const history = await alg.train(X, Y, this.description.optimization, d.test);
        const [T, TY] = d.test;
        const Y_hat = await alg.predict(X, this.description.optimization);
        const TY_hat = await alg.predict(T, this.description.optimization);
        const trainError = analysis_1.getClassificationError(Y_hat, Y).get();
        const testError = analysis_1.getClassificationError(TY_hat, TY).get();
        obs.next({
            tag: 'test',
            type: 'txt',
            path: `test.csv`,
            data: testError,
        });
        obs.next({
            tag: 'train',
            type: 'txt',
            path: `train.csv`,
            data: trainError,
        });
        const loss = history.loss;
        obs.next({
            tag: 'aux_loss',
            type: 'idx',
            path: `loss.idx`,
            data: { buf: loss, shape: [loss.length] },
        });
        for (const k of Object.keys(history.other)) {
            const loss = history.other[k];
            obs.next({
                tag: 'aux_loss',
                type: 'idx',
                path: `${k}.idx`,
                data: { buf: loss, shape: [loss.length] },
            });
        }
    }
}
exports.ClassificationErrorExperiment = ClassificationErrorExperiment;
//# sourceMappingURL=ClassificationError.js.map