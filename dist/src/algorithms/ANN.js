"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tf = require("@tensorflow/tfjs");
const _ = require("lodash");
const v = require("validtyped");
const Optimizer = require("../optimization/Optimizer");
const Algorithm_1 = require("../algorithms/Algorithm");
const layers_1 = require("../algorithms/utils/layers");
exports.ANNMetaParameterSchema = v.object({
    layers: v.array(layers_1.LayerMetaParametersSchema),
    loss: v.string(['categoricalCrossentropy', 'binaryCrossentropy', 'meanSquaredError']),
}, { optional: ['loss'] });
class ANN extends Algorithm_1.SupervisedAlgorithm {
    // ----------------
    // Model Definition
    // ----------------
    constructor(datasetDescription, opts) {
        super(datasetDescription);
        this.datasetDescription = datasetDescription;
        this.name = ANN.name;
        this.opts = _.merge({
            layers: [],
            loss: 'binaryCrossentropy',
        }, opts);
        const inputs = tf.layers.input({ shape: [this.datasetDescription.features] });
        const network = layers_1.constructTFNetwork(this.opts.layers, inputs);
        const outputType = this.opts.loss === 'categoricalCrossentropy' ? 'softmax' :
            this.opts.loss === 'binaryCrossentropy' ? 'sigmoid' :
                this.opts.loss === 'meanSquaredError' ? 'linear' :
                    'sigmoid';
        const outputs_y = tf.layers.dense({ units: this.datasetDescription.classes, activation: outputType, name: 'out_y' }).apply(_.last(network));
        this.model = tf.model({
            inputs: [inputs],
            outputs: [outputs_y],
        });
    }
    summary() {
        this.model.summary(72);
    }
    // --------
    // Training
    // --------
    async _train(X, Y, opts) {
        const o = Optimizer.getDefaultParameters(opts);
        this.model.compile({
            optimizer: Optimizer.getTfOptimizer(o),
            loss: this.opts.loss,
        });
        return Optimizer.fit(this.model, X, Y, {
            batchSize: o.batchSize,
            epochs: o.iterations,
            shuffle: true,
        });
    }
    async _predict(X) {
        const Y_hat = this.model.predictOnBatch(X);
        return Y_hat;
    }
    // -----------------
    // Utility Functions
    // -----------------
    static async fromANN(ann, opts) {
        const o = _.merge({
            keepWeights: false,
            newOutputSize: ann.datasetDescription.classes,
            retrain: true,
        }, opts);
        const description = { ...ann.datasetDescription, classes: o.newOutputSize };
        const ann2 = new ANN(description, ann.opts);
        if (!o.keepWeights)
            return ann2;
        const oldModel = ann.model;
        const newModel = ann2.model;
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
    }
}
exports.ANN = ANN;
//# sourceMappingURL=ANN.js.map