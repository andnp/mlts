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
const History_1 = require("../analysis/History");
const layers_1 = require("../algorithms/utils/layers");
exports.ANNMetaParameterSchema = v.object({
    layers: v.array(layers_1.LayerMetaParametersSchema),
    loss: v.string(['binaryCrossentropy', 'meanSquaredError']),
}, { optional: ['loss'] });
const MODEL = 'model';
class ANN extends Algorithm_1.Algorithm {
    // ----------------
    // Model Definition
    // ----------------
    constructor(datasetDescription, opts, saveLocation = 'savedModels') {
        super(datasetDescription, saveLocation);
        this.datasetDescription = datasetDescription;
        this.name = ANN.name;
        this.opts = _.merge({
            layers: [{ units: 25, regularizer: { type: 'l1', weight: 0 }, activation: 'sigmoid', type: 'dense' }],
            loss: 'binaryCrossentropy',
        }, opts);
    }
    _build() {
        return __awaiter(this, void 0, void 0, function* () {
            this.registerModel(MODEL, () => {
                const inputs = tf.layers.input({ shape: [this.datasetDescription.features] });
                const network = layers_1.constructTFNetwork(this.opts.layers, inputs);
                const outputType = this.opts.loss === 'binaryCrossentropy' ? 'sigmoid' :
                    this.opts.loss === 'meanSquaredError' ? 'linear' :
                        'sigmoid';
                const outputs_y = tf.layers.dense({ units: this.datasetDescription.classes, activation: outputType, name: 'out_y' }).apply(_.last(network));
                const model = tf.model({
                    inputs: [inputs],
                    outputs: [outputs_y],
                });
                return model;
            });
        });
    }
    summary() {
        this.getModel().summary(72);
    }
    // --------
    // Training
    // --------
    _train(X, Y, opts) {
        return __awaiter(this, void 0, void 0, function* () {
            const o = this.getDefaultOptimizationParameters(opts);
            const optimizer = this.registerOptimizer('opt', () => new Optimizer_1.Optimizer(o));
            const model = this.assertModel(MODEL);
            model.compile({
                optimizer: optimizer.getTfOptimizer(),
                loss: this.opts.loss,
            });
            const history = yield optimizer.fit(model, X, Y, {
                batchSize: o.batchSize,
                epochs: o.iterations,
                shuffle: true,
            });
            this.clearOptimizer('opt');
            return History_1.History.fromTensorflowHistory(this.name, this.opts, history);
        });
    }
    loss(X, Y) {
        const model = this.assertModel(MODEL);
        const Y_hat = model.predict(X);
        return tf.losses.sigmoidCrossEntropy(Y, Y_hat);
    }
    _predict(X) {
        return __awaiter(this, void 0, void 0, function* () {
            const model = this.assertModel(MODEL);
            const Y_hat = model.predictOnBatch(X);
            return Y_hat;
        });
    }
    // ------
    // Saving
    // ------
    static fromSavedState(location) {
        return __awaiter(this, void 0, void 0, function* () {
            return new ANN({}).loadFromDisk(location);
        });
    }
    getDefaultOptimizationParameters(o) {
        return _.merge({
            iterations: 100,
            type: 'rmsprop',
            learningRate: 0.001,
        }, o);
    }
    // -----------------
    // Utility Functions
    // -----------------
    static fromANN(ann, opts) {
        return __awaiter(this, void 0, void 0, function* () {
            const o = _.merge({
                keepWeights: false,
                newOutputSize: ann.datasetDescription.classes,
                retrain: true,
            }, opts);
            const description = Object.assign({}, ann.datasetDescription, { classes: o.newOutputSize });
            const ann2 = new ANN(description, ann.opts);
            yield ann2.build();
            if (!o.keepWeights)
                return ann2;
            const oldModel = ann.getModel();
            const newModel = ann2.getModel();
            const layers = oldModel.layers;
            const length = o.newOutputSize !== ann.datasetDescription.classes
                ? layers.length - 1
                : layers.length;
            for (let i = 0; i < length; ++i) {
                const layer = newModel.getLayer(undefined, i);
                layer.setWeights(layers[i].getWeights());
                layer.trainable = o.retrain;
            }
            return ann2;
        });
    }
}
exports.ANN = ANN;
//# sourceMappingURL=ANN.js.map