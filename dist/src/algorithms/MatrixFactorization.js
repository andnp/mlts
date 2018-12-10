"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tf = require("@tensorflow/tfjs");
const _ = require("lodash");
const v = require("validtyped");
const Algorithm_1 = require("../algorithms/Algorithm");
const Optimizer_1 = require("../optimization/Optimizer");
const regularizers_1 = require("../regularizers/regularizers");
class DictLayer extends tf.layers.Layer {
    constructor(config) {
        super(config);
        this.config = config;
        this.name = DictLayer.name;
        this.trainable = true;
        this.D = this.addWeight('D', [this.config.hidden, this.config.datasetDescription.features], 'float32', tf.initializers.glorotNormal({}), regularizers_1.regularizeLayer(this.config.regularizerD));
        this.H = this.addWeight('H', [this.config.datasetDescription.samples, this.config.hidden], 'float32', tf.initializers.glorotNormal({}), regularizers_1.regularizeLayer(this.config.regularizerH));
    }
    build() {
        this.built = true;
        this.trainableWeights = [this.D, this.H];
    }
    computeOutputShape(shape) {
        return [this.config.datasetDescription.samples, this.config.datasetDescription.features];
    }
    call(inputs) {
        return tf.tidy(() => tf.matMul(this.H.read(), this.D.read()));
    }
    getClassName() {
        return DictLayer.name;
    }
    getConfig() {
        return this.config;
    }
}
DictLayer.className = DictLayer.name;
tf.serialization.registerClass(DictLayer);
class MatrixFactorization extends Algorithm_1.UnsupervisedAlgorithm {
    constructor(datasetDescription, opts) {
        super(datasetDescription);
        this.datasetDescription = datasetDescription;
        this.name = MatrixFactorization.name;
        this.opts = this.getDefaults(opts);
        this.model = this.constructModel(this.datasetDescription);
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
    constructModel(desc) {
        const model = tf.sequential();
        model.add(tf.layers.inputLayer({ inputShape: [desc.features] }));
        model.add(new DictLayer({ ...this.opts, datasetDescription: desc }));
        return model;
    }
    loss(X) {
        const X_hat = this.model.predict(X);
        return tf.losses.meanSquaredError(X, X_hat);
    }
    async _train(X, o) {
        const optimizer = new Optimizer_1.Optimizer(o);
        this.model.compile({
            optimizer: optimizer.getTfOptimizer(),
            loss: 'meanSquaredError',
        });
        return optimizer.fit(this.model, X, X, {
            batchSize: X.shape[0],
            epochs: o.iterations,
            shuffle: false,
        });
    }
    async _predict(X, o) {
        const optimizer = new Optimizer_1.Optimizer(o);
        const predictionModel = this.constructModel({
            ...this.datasetDescription,
            samples: X.shape[0],
        });
        const dictLayer = predictionModel.getLayer(DictLayer.name);
        predictionModel.compile({
            optimizer: optimizer.getTfOptimizer(),
            loss: 'meanSquaredError',
        });
        const randomH = dictLayer.getWeights()[1];
        dictLayer.setWeights([this.D, randomH]);
        await optimizer.fit(predictionModel, X, X, {
            batchSize: X.shape[0],
            epochs: o.iterations,
            shuffle: false,
        });
        return predictionModel.predictOnBatch(X);
    }
    get D() {
        return this.model.getLayer(DictLayer.name).getWeights()[0];
    }
    get H() {
        return this.model.getLayer(DictLayer.name).getWeights()[1];
    }
    setD(tensor) {
        this.model.getLayer(DictLayer.name).setWeights([tensor, this.H]);
    }
}
exports.MatrixFactorization = MatrixFactorization;
exports.MatrixFactorizationMetaParametersSchema = v.object({
    regularizerD: regularizers_1.RegularizerParametersSchema,
    regularizerH: regularizers_1.RegularizerParametersSchema,
    hidden: v.number(),
});
//# sourceMappingURL=MatrixFactorization.js.map