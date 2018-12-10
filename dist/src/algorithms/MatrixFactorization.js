"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tf = require("@tensorflow/tfjs");
const _ = require("lodash");
const v = require("validtyped");
const Algorithm_1 = require("../algorithms/Algorithm");
const Optimizer_1 = require("../optimization/Optimizer");
const regularizers_1 = require("../regularizers/regularizers");
const tensorflow_1 = require("../utils/tensorflow");
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
    loss(X, H, D) {
        const X_hat = H.matMul(D);
        const regD = this.opts.regularizerD ? regularizers_1.regularize(this.opts.regularizerD, D) : tf.scalar(0);
        const regH = this.opts.regularizerH ? regularizers_1.regularize(this.opts.regularizerH, H) : tf.scalar(0);
        return tf.losses.meanSquaredError(X, X_hat).add(regD).add(regH);
    }
    async _train(X, o) {
        const optimizer = new Optimizer_1.Optimizer(o);
        return optimizer.minimize(() => this.loss(X, this.h, this.d), [this.d, this.h]);
    }
    async _predict(X, o) {
        const optimizer = new Optimizer_1.Optimizer(o);
        const Htest = tensorflow_1.randomInitVariable([X.shape[0], this.opts.hidden]);
        await optimizer.minimize(() => this.loss(X, Htest, this.d), [Htest]);
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
}, { optional: ['regularizerD', 'regularizerH'] });
//# sourceMappingURL=MatrixFactorization.js.map