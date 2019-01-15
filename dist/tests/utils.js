"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tf = require("@tensorflow/tfjs");
const _ = require("lodash");
const utilities_ts_1 = require("utilities-ts");
const data_1 = require("data");
const experiments_1 = require("experiments");
const analysis_1 = require("analysis");
function getRandomClassificationData(description, means, variance) {
    return tf.tidy(() => {
        const bins = _.times(description.classes, (c) => {
            const features = _.times(description.features, (f) => {
                const mean = means.get(c, f);
                return tf.randomNormal([description.samples], mean, 0.5).as2D(description.samples, 1);
            });
            const x = tf.concat2d(features, 1);
            const y = tf.tensor1d(_.times(description.samples, () => c), "int32");
            return utilities_ts_1.tuple(x, y);
        });
        const Xs = bins.map(d => d[0]);
        const Ys = bins.map(d => d[1]);
        return utilities_ts_1.tuple(tf.concat2d(Xs, 0), tf.oneHot(tf.concat1d(Ys), description.classes).asType('float32'));
    });
}
function getFakeClassificationDataset(description, difficulty) {
    const variance = difficulty === 'easy' ? .1 :
        difficulty === 'medium' ? 10 :
            difficulty === 'hard' ? 100 :
                /* default */ .1;
    const means = tf.randomUniform([description.classes, description.features], -5, 5);
    const [X, Y] = getRandomClassificationData(description, means, variance);
    const [T, TY] = getRandomClassificationData(description, means, variance);
    return new data_1.TensorflowDataset(X, Y, T, TY).scaleColumns();
}
exports.getFakeClassificationDataset = getFakeClassificationDataset;
exports.buildClassificationTest = (params) => async () => {
    const { alg, dataset, optimization, error } = params;
    const expDescription = experiments_1.ExperimentDescription.fromManualSetup(alg, dataset, optimization);
    const exp = new experiments_1.ClassificationErrorExperiment(expDescription);
    let messages = 0;
    await exp.run().subscribe(msg => {
        if (msg.tag === 'test' || msg.tag === 'train') {
            expect(msg.data).toBeLessThan(error);
            messages++;
        }
    });
    expect(messages).toBe(2);
};
exports.buildUnsupervisedReconstructionTest = (params) => async () => {
    const { alg, dataset, optimization, error } = params;
    const [X] = dataset.train;
    const [T] = dataset.test;
    await alg.train(X, optimization);
    const X_hat = await alg.predict(X, optimization);
    const T_hat = await alg.predict(T, optimization);
    const train_error = analysis_1.meanSquaredError(X_hat, X).get();
    const test_error = analysis_1.meanSquaredError(T_hat, T).get();
    expect(train_error).toBeLessThan(error);
    expect(test_error).toBeLessThan(error);
};
//# sourceMappingURL=utils.js.map