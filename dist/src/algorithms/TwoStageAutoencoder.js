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
exports.TwoStageAutoencoderMetaParameterSchema = v.object({
    layers: v.array(layers_1.LayerMetaParametersSchema),
    retrainRepresentation: v.boolean(),
});
const PREDICTION_MODEL = 'predictionModel';
const MODEL = 'model';
class TwoStageAutoencoder extends Algorithm_1.Algorithm {
    // ----------------
    // Model Definition
    // ----------------
    constructor(datasetDescription, opts, saveLocation = 'savedModels') {
        super(datasetDescription, saveLocation);
        this.datasetDescription = datasetDescription;
        this.name = TwoStageAutoencoder.name;
        this.state = { activeStage: 'stage1' };
        this.opts = _.merge({
            layers: [{ units: 25, regularizer: { type: 'l1', weight: 0 }, activation: 'sigmoid', type: 'dense' }],
            retrainRepresentation: false,
        }, opts);
    }
    _build() {
        return __awaiter(this, void 0, void 0, function* () {
            // ---------------------
            // Create learning model
            // ---------------------
            const model = this.registerModel(MODEL, () => {
                arrays.middleItem(this.opts.layers).name = 'representationLayer';
                const inputs = tf.layers.input({ shape: [this.datasetDescription.features] });
                const network = layers_1.constructTFNetwork(this.opts.layers, inputs);
                const outputs_x = tf.layers.dense({ units: this.datasetDescription.features, activation: 'linear', name: 'out_x' }).apply(_.last(network));
                return tf.model({
                    inputs: [inputs],
                    outputs: [outputs_x],
                });
            });
            this.representationLayer = model.getLayer('representationLayer').output;
            this.inputs = model.input;
            // -----------------------
            // Create prediction model
            // -----------------------
            const predictionModel = this.registerModel(PREDICTION_MODEL, () => {
                const predictionLayer = tf.layers.dense({ units: this.datasetDescription.classes, activation: 'sigmoid' });
                const predictionOutputs = predictionLayer.apply(this.representationLayer);
                return tf.model({
                    inputs: [this.inputs],
                    outputs: [predictionOutputs]
                });
            });
            console.log('Representation Model::'); // tslint:disable-line no-console
            model.summary(72);
            console.log('Prediction Model::'); // tslint:disable-line no-console
            predictionModel.summary(72);
        });
    }
    // --------
    // Training
    // --------
    _train(X, Y, opts) {
        return __awaiter(this, void 0, void 0, function* () {
            const o = this.getDefaultOptimizationParameters(opts);
            const model = this.assertModel(MODEL);
            let history;
            // -------
            // Stage 1
            // -------
            if (this.state.activeStage === 'stage1') {
                const optimizer = this.registerOptimizer('opt', () => new Optimizer_1.Optimizer(o));
                model.compile({
                    optimizer: optimizer.getTfOptimizer(),
                    loss: 'meanSquaredError',
                });
                history = yield optimizer.fit(model, X, X, {
                    batchSize: o.batchSize,
                    epochs: o.iterations,
                    shuffle: true,
                });
                this.clearOptimizer('opt');
                this.state.activeStage = 'stage2';
            }
            // -------
            // Stage 2
            // -------
            if (this.state.activeStage === 'stage2') {
                const optimizer = this.registerOptimizer('opt', () => new Optimizer_1.Optimizer(o));
                const predictionModel = this.assertModel(PREDICTION_MODEL);
                // transfer weights from learning model to prediction model
                predictionModel.layers.forEach((layer, i) => {
                    if (i === predictionModel.layers.length - 1)
                        return;
                    layer.setWeights(model.getLayer(undefined, i).getWeights());
                    layer.trainable = this.opts.retrainRepresentation;
                });
                predictionModel.compile({
                    optimizer: optimizer.getTfOptimizer(),
                    loss: 'categoricalCrossentropy',
                });
                history = yield optimizer.fit(predictionModel, X, Y, {
                    batchSize: o.batchSize,
                    epochs: o.iterations,
                    shuffle: true,
                });
                this.clearOptimizer('opt');
                this.state.activeStage = 'complete';
            }
            return history
                ? History_1.History.fromTensorflowHistory(this.name, this.opts, history)
                : History_1.History.initializeEmpty(this.name, this.opts);
        });
    }
    loss(X, Y) {
        const model = this.assertModel(MODEL);
        const X_hat = model.predict(X);
        return tf.losses.meanSquaredError(X, X_hat);
    }
    getRepresentation(X) {
        return __awaiter(this, void 0, void 0, function* () {
            const model = this.assertModel(MODEL);
            const representationModel = tf.model({
                inputs: [this.inputs],
                outputs: [this.representationLayer],
            });
            // transfer weights from learned model to representation model
            representationModel.layers.forEach((layer, i) => layer.setWeights(model.getLayer(undefined, i).getWeights()));
            return representationModel.predictOnBatch(X);
        });
    }
    reconstructionLoss(X) {
        const model = this.assertModel(MODEL);
        const x_loss = model.evaluate(X, X);
        return x_loss.get();
    }
    _predict(X) {
        return __awaiter(this, void 0, void 0, function* () {
            const model = this.assertModel(PREDICTION_MODEL);
            return model.predictOnBatch(X);
        });
    }
    // ------
    // Saving
    // ------
    static fromSavedState(location) {
        return __awaiter(this, void 0, void 0, function* () {
            return new TwoStageAutoencoder({}).loadFromDisk(location);
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
exports.TwoStageAutoencoder = TwoStageAutoencoder;
//# sourceMappingURL=TwoStageAutoencoder.js.map