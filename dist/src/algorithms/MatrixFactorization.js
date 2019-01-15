"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tf = require("@tensorflow/tfjs");
const _ = require("lodash");
const v = require("validtyped");
const Algorithm_1 = require("../algorithms/Algorithm");
const Optimizer = require("../optimization/Optimizer");
const regularizers_1 = require("../regularizers/regularizers");
const tensorflow_1 = require("../utils/tensorflow");
const analysis_1 = require("analysis");
class MatrixFactorization extends Algorithm_1.UnsupervisedAlgorithm {
    constructor(datasetDescription, opts) {
        super(datasetDescription);
        this.datasetDescription = datasetDescription;
        this.name = MatrixFactorization.name;
        this.opts = this.getDefaults(opts);
        this.d = tensorflow_1.randomInitVariable([this.opts.hidden, this.datasetDescription.features]);
        this.h = tensorflow_1.randomInitVariable([this.datasetDescription.samples, this.opts.hidden]);
    }
    getDefaults(opts) {
        return _.merge({
            regularizerD: {
                type: 'l1',
                weight: 0,
            },
            regularizerH: {
                type: 'l1',
                weight: 0,
            },
            hidden: 2,
        }, opts);
    }
    loss(X, H, D, mask) {
        const X_hat = H.matMul(D).mulStrict(mask);
        const regD = this.opts.regularizerD ? regularizers_1.regularize(this.opts.regularizerD, D) : tf.scalar(0);
        const regH = this.opts.regularizerH ? regularizers_1.regularize(this.opts.regularizerH, H) : tf.scalar(0);
        return tf.losses.meanSquaredError(X, X_hat).add(regD).add(regH);
    }
    buildMask(X) {
        return tf.tidy(() => this.opts.useMissingMask
            ? tf.where(X.equal(tf.scalar(0)), tf.zerosLike(X), tf.onesLike(X))
            : tf.onesLike(X));
    }
    async _train(X, o) {
        const mask = this.buildMask(X);
        const losses = await Optimizer.minimize(() => this.loss(X, this.h, this.d, mask), o, [this.d, this.h]);
        return new analysis_1.History('MatrixFactorization', this.opts, losses);
    }
    async _predict(X, o) {
        const Htest = tensorflow_1.randomInitVariable([X.shape[0], this.opts.hidden]);
        const mask = this.buildMask(X);
        await Optimizer.minimize(() => this.loss(X, Htest, this.d, mask), o, [Htest]);
        return tf.tidy(() => Htest.matMul(this.d));
    }
    get D() {
        return this.d;
    }
    get H() {
        return this.h;
    }
    setD(tensor) {
        this.d = tf.variable(tensor);
    }
}
exports.MatrixFactorization = MatrixFactorization;
exports.MatrixFactorizationMetaParametersSchema = v.object({
    regularizerD: regularizers_1.RegularizerParametersSchema,
    regularizerH: regularizers_1.RegularizerParametersSchema,
    hidden: v.number(),
    useMissingMask: v.boolean(),
}, { optional: ['regularizerD', 'regularizerH', 'useMissingMask'] });
//# sourceMappingURL=MatrixFactorization.js.map