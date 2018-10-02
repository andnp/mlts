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
const arrays = require("../utils/arrays");
exports.SupervisedAutoencoderMetaParameterSchema = v.object({
    layers: v.array(layers_1.LayerMetaParametersSchema),
});
const MODEL = 'model';
class SupervisedAutoencoder extends Algorithm_1.Algorithm {
    // ----------------
    // Model Definition
    // ----------------
    constructor(datasetDescription, opts, saveLocation = 'savedModels') {
        super(datasetDescription, saveLocation);
        this.datasetDescription = datasetDescription;
        this.name = SupervisedAutoencoder.name;
        this.opts = _.merge({
            layers: [{ units: 25, regularizer: { type: 'l1', weight: 0 }, activation: 'sigmoid', type: 'dense' }]
        }, opts);
    }
    _build() {
        return __awaiter(this, void 0, void 0, function* () {
            const model = this.registerModel(MODEL, () => {
                const inputs = tf.layers.input({ shape: [this.datasetDescription.features] });
                const representationLayerDescription = arrays.middleItem(this.opts.layers);
                representationLayerDescription.name = 'representationLayer';
                const network = layers_1.constructTFNetwork(this.opts.layers, inputs);
                const representationLayer = arrays.middleItem(network);
                const outputs_y = tf.layers.dense({ units: this.datasetDescription.classes, activation: 'sigmoid', name: 'out_y' }).apply(representationLayer);
                const outputs_x = tf.layers.dense({ units: this.datasetDescription.features, activation: 'linear', name: 'out_x' }).apply(_.last(network));
                const model = tf.model({
                    inputs: [inputs],
                    outputs: [outputs_y, outputs_x],
                });
                model.summary(72);
                return model;
            });
            this.representationLayer = model.getLayer('representationLayer').output;
            this.inputs = model.input;
        });
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
                loss: ['categoricalCrossentropy', 'meanSquaredError'],
                metrics: { out_y: 'accuracy' },
            });
            const history = yield optimizer.fit(model, X, [Y, X], {
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
        const [Y_hat, X_hat] = model.predict(X);
        return tf.losses.sigmoidCrossEntropy(Y, Y_hat).add(tf.losses.meanSquaredError(X, X_hat));
    }
    getRepresentation(X) {
        return __awaiter(this, void 0, void 0, function* () {
            const originalModel = this.assertModel(MODEL);
            const model = tf.model({
                inputs: [this.inputs],
                outputs: [this.representationLayer],
            });
            model.layers.forEach((layer, i) => layer.setWeights(originalModel.getLayer(undefined, i).getWeights()));
            const H = model.predictOnBatch(X);
            return H;
        });
    }
    reconstructionLoss(X) {
        const model = this.assertModel(MODEL);
        const fake_y = tf.zeros([X.shape[0], this.datasetDescription.classes]);
        const [, x_loss] = model.evaluate(X, [fake_y, X]);
        return x_loss.get();
    }
    _predict(X) {
        return __awaiter(this, void 0, void 0, function* () {
            const model = this.assertModel(MODEL);
            const Y_hat_batches = X.split(10).map(d => model.predictOnBatch(d)[0]);
            const Y_hat = tf.concat(Y_hat_batches, 0);
            return Y_hat;
        });
    }
    // ------
    // Saving
    // ------
    static fromSavedState(location) {
        return __awaiter(this, void 0, void 0, function* () {
            return new SupervisedAutoencoder({}).loadFromDisk(location);
        });
    }
    getDefaultOptimizationParameters(o) {
        return _.merge({
            iterations: 100,
            type: 'adadelta',
            learningRate: 0.5,
        }, o);
    }
}
exports.SupervisedAutoencoder = SupervisedAutoencoder;
//# sourceMappingURL=SupervisedAutoencoder.js.map