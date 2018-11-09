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
const tf = require("@tensorflow/tfjs");
const _ = require("lodash");
const v = require("validtyped");
const Algorithm_1 = require("../algorithms/Algorithm");
const Optimizer_1 = require("../optimization/Optimizer");
const regularizers_1 = require("../regularizers/regularizers");
const History_1 = require("../analysis/History");
exports.LinearRegressionMetaParameterSchema = v.object({
    regularizer: regularizers_1.RegularizerParametersSchema,
    initialParameters: v.object({
        mean: v.number(),
        stddev: v.number(),
    }),
}, { optional: ['initialParameters'] });
class LinearRegression extends Algorithm_1.Algorithm {
    constructor(datasetDescription, opts, saveLocation = 'savedModels') {
        super(datasetDescription, saveLocation);
        this.datasetDescription = datasetDescription;
        this.name = LinearRegression.name;
        this.opts = _.merge({
            regularizer: { type: 'l1', weight: 0 },
            initialParameters: { mean: 0, variance: 1 },
        }, opts);
    }
    _build() {
        return __awaiter(this, void 0, void 0, function* () {
            this.model = this.registerModel('model', () => {
                const model = tf.sequential();
                model.add(tf.layers.inputLayer({ inputShape: [this.datasetDescription.features] }));
                model.add(tf.layers.dense({
                    units: this.datasetDescription.classes,
                    kernelInitializer: tf.initializers.randomNormal(Object.assign({}, this.opts.initialParameters)),
                    activation: 'linear',
                    kernelRegularizer: regularizers_1.regularizeLayer(this.opts.regularizer),
                    name: 'W',
                }));
                return model;
            });
        });
    }
    _train(X, Y, opts) {
        return __awaiter(this, void 0, void 0, function* () {
            const o = this.getDefaultOptimizationParameters(opts);
            const optimizer = this.registerOptimizer('optimizer', () => new Optimizer_1.Optimizer(o));
            this.model.compile({
                optimizer: optimizer.getTfOptimizer(),
                loss: 'meanSquaredError',
            });
            const history = yield optimizer.fit(this.model, X, Y, {
                batchSize: o.batchSize || X.shape[0],
                epochs: o.iterations,
                shuffle: true,
            });
            this.clearOptimizer('optimizer');
            return History_1.History.fromTensorflowHistory(this.name, this.opts, history);
        });
    }
    loss(X, Y) {
        const Y_hat = this.model.predict(X);
        return tf.losses.meanSquaredError(Y, Y_hat);
    }
    _predict(X) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.model.predict(X);
        });
    }
    static fromSavedState(location) {
        return __awaiter(this, void 0, void 0, function* () {
            return new LinearRegression({}).loadFromDisk(location);
        });
    }
    get W() { return this.model.getLayer('W').getWeights()[0]; }
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