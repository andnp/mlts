"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tf = require("@tensorflow/tfjs");
const _ = require("lodash");
const v = require("validtyped");
const Algorithm_1 = require("../algorithms/Algorithm");
const Optimizer_1 = require("../optimization/Optimizer");
const regularizers_1 = require("../regularizers/regularizers");
exports.LinearRegressionMetaParameterSchema = v.object({
    regularizer: regularizers_1.RegularizerParametersSchema,
    initialParameters: v.object({
        mean: v.number(),
        stddev: v.number(),
    }),
}, { optional: ['initialParameters', 'regularizer'] });
class LinearRegression extends Algorithm_1.SupervisedAlgorithm {
    constructor(datasetDescription, opts) {
        super(datasetDescription);
        this.datasetDescription = datasetDescription;
        this.name = LinearRegression.name;
        this.opts = _.merge({
            regularizer: { type: 'l1', weight: 0 },
            initialParameters: { mean: 0, variance: 1 },
        }, opts);
        const model = tf.sequential();
        model.add(tf.layers.inputLayer({ inputShape: [this.datasetDescription.features] }));
        model.add(tf.layers.dense({
            units: this.datasetDescription.classes,
            kernelInitializer: tf.initializers.randomNormal({ ...this.opts.initialParameters }),
            activation: 'linear',
            kernelRegularizer: this.opts.regularizer && regularizers_1.regularizeLayer(this.opts.regularizer),
            name: 'W',
        }));
        this.model = model;
    }
    async _train(X, Y, opts) {
        const o = this.getDefaultOptimizationParameters(opts);
        const optimizer = new Optimizer_1.Optimizer(o);
        this.model.compile({
            optimizer: optimizer.getTfOptimizer(),
            loss: 'meanSquaredError',
        });
        return optimizer.fit(this.model, X, Y, {
            batchSize: o.batchSize || X.shape[0],
            epochs: o.iterations,
            shuffle: true,
        });
    }
    loss(X, Y) {
        const Y_hat = this.model.predict(X);
        return tf.losses.meanSquaredError(Y, Y_hat);
    }
    async _predict(X) {
        return this.model.predict(X);
    }
    get W() { return this.model.getLayer('W').getWeights()[0]; }
    set W(w) { this.model.getLayer('W').setWeights([w, this.model.getLayer('W').getWeights()[1]]); }
    getDefaultOptimizationParameters(o) {
        return _.merge({
            iterations: 100,
            type: 'adadelta',
            learningRate: 0.5,
        }, o);
    }
}
exports.LinearRegression = LinearRegression;
//# sourceMappingURL=LinearRegression.js.map