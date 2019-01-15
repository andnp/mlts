"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tf = require("@tensorflow/tfjs");
const _ = require("lodash");
const v = require("validtyped");
const Algorithm_1 = require("../algorithms/Algorithm");
const Optimizer = require("../optimization/Optimizer");
const tensorflow_1 = require("../utils/tensorflow");
const regularizers_1 = require("../regularizers/regularizers");
const analysis_1 = require("analysis");
exports.SupervisedDictionaryLearningMetaParameterSchema = v.object({
    regularizer: regularizers_1.RegularizerParametersSchema,
    hidden: v.number(),
});
class SupervisedDictionaryLearning extends Algorithm_1.SupervisedAlgorithm {
    constructor(datasetDescription, opts) {
        super(datasetDescription);
        this.datasetDescription = datasetDescription;
        this.name = SupervisedDictionaryLearning.name;
        this.w = tensorflow_1.randomInitVariable([this.datasetDescription.classes, this.opts.hidden]);
        this.h = tensorflow_1.randomInitVariable([this.opts.hidden, this.datasetDescription.samples]);
        this.d = tensorflow_1.randomInitVariable([this.datasetDescription.features, this.opts.hidden]);
        this.loss = tensorflow_1.autoDispose((X, Y) => {
            const Y_hat = tf.sigmoid(tf.matMul(this.W, this.H));
            const X_hat = tf.matMul(this.D, this.H);
            const y_loss = tf.losses.sigmoidCrossEntropy(Y.transpose(), Y_hat);
            const x_loss = tf.losses.meanSquaredError(X.transpose(), X_hat);
            const reg = regularizers_1.regularize(this.opts.regularizer, this.W);
            return y_loss.add(x_loss).add(reg);
        });
        this.opts = _.merge({
            regularizer: { type: 'l1', weight: 0 },
            hidden: 2,
        }, opts);
    }
    async _train(X, Y, opts) {
        const o = this.getDefaultOptimizerParameters(opts);
        const loss = await Optimizer.minimize(_.partial(this.loss, X, Y), o, [this.W, this.D, this.H]);
        return new analysis_1.History(this.name, this.opts, loss);
    }
    async _predict(X, opts) {
        const o = this.getDefaultOptimizerParameters(opts);
        const H_test = (X.shape[0] === this.datasetDescription.samples)
            ? this.H
            : tensorflow_1.randomInitVariable([this.opts.hidden, X.shape[0]]);
        await Optimizer.minimize(() => {
            const X_hat = tf.matMul(this.D, H_test);
            return tf.losses.meanSquaredError(X.transpose(), X_hat);
        }, o, [H_test]);
        return tf.tidy(() => {
            return tf.sigmoid(tf.matMul(this.W, H_test)).transpose();
        });
    }
    getDefaultOptimizerParameters(o) {
        return _.merge({
            iterations: 1000,
            type: 'adadelta',
            learningRate: 1.0,
        }, o);
    }
    get W() { return this.w; }
    get H() { return this.h; }
    get D() { return this.d; }
}
exports.SupervisedDictionaryLearning = SupervisedDictionaryLearning;
//# sourceMappingURL=SupervisedDictionaryLearning.js.map