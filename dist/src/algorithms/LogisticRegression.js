"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tf = require("@tensorflow/tfjs");
const _ = require("lodash");
const v = require("validtyped");
const Algorithm_1 = require("../algorithms/Algorithm");
const Optimizer_1 = require("../optimization/Optimizer");
const regularizers_1 = require("../regularizers/regularizers");
const History_1 = require("../analysis/History");
exports.LogisticRegressionMetaParameterSchema = v.object({
    regularizer: regularizers_1.RegularizerParametersSchema,
}, { optional: ['regularizer'] });
class LogisticRegression extends Algorithm_1.Algorithm {
    constructor(datasetDescription, opts, saveLocation = 'savedModels') {
        super(datasetDescription, saveLocation);
        this.datasetDescription = datasetDescription;
        this.name = LogisticRegression.name;
        this.opts = _.merge({
            regularizer: { type: 'l1', weight: 0 },
        }, opts);
    }
    async _build() {
        this.model = this.registerModel('model', () => {
            const model = tf.sequential();
            model.add(tf.layers.inputLayer({ inputShape: [this.datasetDescription.features] }));
            model.add(tf.layers.dense({
                units: this.datasetDescription.classes,
                activation: 'sigmoid',
                kernelRegularizer: this.opts.regularizer && regularizers_1.regularizeLayer(this.opts.regularizer),
                name: 'W',
            }));
            return model;
        });
    }
    async _train(X, Y, opts) {
        const o = this.getDefaultOptimizationParameters(opts);
        const optimizer = this.registerOptimizer('optimizer', () => new Optimizer_1.Optimizer(o));
        this.model.compile({
            optimizer: optimizer.getTfOptimizer(),
            loss: 'binaryCrossentropy',
        });
        const history = await optimizer.fit(this.model, X, Y, {
            batchSize: o.batchSize || X.shape[0],
            epochs: o.iterations,
            shuffle: true,
        });
        this.clearOptimizer('optimizer');
        return History_1.History.fromTensorflowHistory(this.name, this.opts, history);
    }
    loss(X, Y) {
        const Y_hat = this.model.predict(X);
        return tf.losses.sigmoidCrossEntropy(Y, Y_hat);
    }
    async _predict(X) {
        return this.model.predict(X);
    }
    static async fromSavedState(location) {
        return new LogisticRegression({}).loadFromDisk(location);
    }
    get W() { return this.model.getLayer('W').getWeights()[0]; }
    setW(W) {
        this.model.getLayer('W').setWeights([W]);
        return this;
    }
    getDefaultOptimizationParameters(o) {
        return _.merge({
            iterations: 100,
            type: 'adadelta',
            learningRate: 0.5,
        }, o);
    }
}
exports.LogisticRegression = LogisticRegression;
//# sourceMappingURL=LogisticRegression.js.map