"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tf = require("@tensorflow/tfjs");
const _ = require("lodash");
const v = require("validtyped");
const utilities_ts_1 = require("utilities-ts");
const Algorithm_1 = require("../algorithms/Algorithm");
const Optimizer_1 = require("../optimization/Optimizer");
const layers_1 = require("../algorithms/utils/layers");
exports.TwoStageAutoencoderMetaParameterSchema = v.object({
    layers: v.array(layers_1.LayerMetaParametersSchema),
    retrainRepresentation: v.boolean(),
});
class TwoStageAutoencoder extends Algorithm_1.SupervisedAlgorithm {
    // ----------------
    // Model Definition
    // ----------------
    constructor(datasetDescription, opts) {
        super(datasetDescription);
        this.datasetDescription = datasetDescription;
        this.name = TwoStageAutoencoder.name;
        this.opts = _.merge({
            layers: [{ units: 25, regularizer: { type: 'l1', weight: 0 }, activation: 'sigmoid', type: 'dense' }],
            retrainRepresentation: false,
        }, opts);
        // ---------------------
        // Create learning model
        // ---------------------
        utilities_ts_1.arrays.middleItem(this.opts.layers).name = 'representationLayer';
        const inputs = tf.layers.input({ shape: [this.datasetDescription.features] });
        const network = layers_1.constructTFNetwork(this.opts.layers, inputs);
        const outputs_x = tf.layers.dense({ units: this.datasetDescription.features, activation: 'linear', name: 'out_x' }).apply(_.last(network));
        this.model = tf.model({
            inputs: [inputs],
            outputs: [outputs_x],
        });
        this.representationLayer = this.model.getLayer('representationLayer').output;
        this.inputs = this.model.input;
        // -----------------------
        // Create prediction model
        // -----------------------
        const predictionLayer = tf.layers.dense({ units: this.datasetDescription.classes, activation: 'sigmoid' });
        const predictionOutputs = predictionLayer.apply(this.representationLayer);
        this.predictionModel = tf.model({
            inputs: [this.inputs],
            outputs: [predictionOutputs]
        });
        console.log('Representation Model::'); // tslint:disable-line no-console
        this.model.summary(72);
        console.log('Prediction Model::'); // tslint:disable-line no-console
        this.predictionModel.summary(72);
    }
    // --------
    // Training
    // --------
    async _train(X, Y, opts) {
        const o = this.getDefaultOptimizationParameters(opts);
        // -------
        // Stage 1
        // -------
        let optimizer = new Optimizer_1.Optimizer(o);
        this.model.compile({
            optimizer: optimizer.getTfOptimizer(),
            loss: 'meanSquaredError',
        });
        await optimizer.fit(this.model, X, X, {
            batchSize: o.batchSize,
            epochs: o.iterations,
            shuffle: true,
        });
        // -------
        // Stage 2
        // -------
        optimizer = new Optimizer_1.Optimizer(o);
        // transfer weights from learning model to prediction model
        this.predictionModel.layers.forEach((layer, i) => {
            if (i === this.predictionModel.layers.length - 1)
                return;
            layer.setWeights(this.model.getLayer(undefined, i).getWeights());
            layer.trainable = this.opts.retrainRepresentation;
        });
        this.predictionModel.compile({
            optimizer: optimizer.getTfOptimizer(),
            loss: 'binaryCrossentropy',
        });
        return optimizer.fit(this.predictionModel, X, Y, {
            batchSize: o.batchSize,
            epochs: o.iterations,
            shuffle: true,
        });
    }
    loss(X, Y) {
        const X_hat = this.model.predict(X);
        return tf.losses.meanSquaredError(X, X_hat);
    }
    async getRepresentation(X) {
        const representationModel = tf.model({
            inputs: [this.inputs],
            outputs: [this.representationLayer],
        });
        // transfer weights from learned model to representation model
        representationModel.layers.forEach((layer, i) => layer.setWeights(this.model.getLayer(undefined, i).getWeights()));
        return representationModel.predictOnBatch(X);
    }
    reconstructionLoss(X) {
        const x_loss = this.model.evaluate(X, X);
        return x_loss.get();
    }
    async _predict(X) {
        return this.predictionModel.predictOnBatch(X);
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