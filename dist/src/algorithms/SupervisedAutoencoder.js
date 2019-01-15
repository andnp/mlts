"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tf = require("@tensorflow/tfjs");
const _ = require("lodash");
const v = require("validtyped");
const Optimizer = require("../optimization/Optimizer");
const utilities_ts_1 = require("utilities-ts");
const Algorithm_1 = require("../algorithms/Algorithm");
const layers_1 = require("../algorithms/utils/layers");
exports.SupervisedAutoencoderMetaParameterSchema = v.object({
    layers: v.array(layers_1.LayerMetaParametersSchema),
});
class SupervisedAutoencoder extends Algorithm_1.SupervisedAlgorithm {
    // ----------------
    // Model Definition
    // ----------------
    constructor(datasetDescription, opts) {
        super(datasetDescription);
        this.datasetDescription = datasetDescription;
        this.name = SupervisedAutoencoder.name;
        this.opts = _.merge({
            layers: [{ units: 25, regularizer: { type: 'l1', weight: 0 }, activation: 'sigmoid', type: 'dense' }]
        }, opts);
        const inputs = tf.layers.input({ shape: [this.datasetDescription.features] });
        const representationLayerDescription = utilities_ts_1.arrays.middleItem(this.opts.layers);
        representationLayerDescription.name = 'representationLayer';
        const network = layers_1.constructTFNetwork(this.opts.layers, inputs);
        const representationLayer = utilities_ts_1.arrays.middleItem(network);
        const outputs_y = tf.layers.dense({ units: this.datasetDescription.classes, activation: 'softmax', name: 'out_y' }).apply(representationLayer);
        const outputs_x = tf.layers.dense({ units: this.datasetDescription.features, activation: 'linear', name: 'out_x' }).apply(_.last(network));
        const model = tf.model({
            inputs: [inputs],
            outputs: [outputs_y, outputs_x],
        });
        this.model = model;
        this.representationLayer = model.getLayer('representationLayer').output;
        this.inputs = model.input;
    }
    // --------
    // Training
    // --------
    async _train(X, Y, opts) {
        const o = Optimizer.getDefaultParameters(opts);
        this.model.compile({
            optimizer: Optimizer.getTfOptimizer(o),
            loss: ['categoricalCrossentropy', 'meanSquaredError'],
            metrics: { out_y: 'accuracy' },
        });
        return Optimizer.fit(this.model, X, [Y, X], {
            batchSize: o.batchSize,
            epochs: o.iterations,
            shuffle: true,
        });
    }
    async getRepresentation(X) {
        const model = tf.model({
            inputs: [this.inputs],
            outputs: [this.representationLayer],
        });
        model.layers.forEach((layer, i) => layer.setWeights(this.model.getLayer(undefined, i).getWeights()));
        const H = model.predictOnBatch(X);
        return H;
    }
    async _predict(X) {
        const Y_hat = this.model.predictOnBatch(X);
        return Y_hat[0];
    }
}
exports.SupervisedAutoencoder = SupervisedAutoencoder;
//# sourceMappingURL=SupervisedAutoencoder.js.map