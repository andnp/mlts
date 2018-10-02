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
const MODEL = 'model';
class MatrixFactorization extends Algorithm_1.Algorithm {
    constructor(datasetDescription, opts, saveLocation = 'savedModels') {
        super(datasetDescription, saveLocation);
        this.datasetDescription = datasetDescription;
        this.name = MatrixFactorization.name;
        this.opts = this.getDefaults(opts);
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
    _build() {
        return __awaiter(this, void 0, void 0, function* () {
            this.registerModel(MODEL, () => {
                const model = tf.sequential();
                model.add(tf.layers.inputLayer({ inputShape: [this.datasetDescription.features] }));
                model.add(new DictLayer(Object.assign({}, this.opts, { datasetDescription: this.datasetDescription })));
                return model;
            });
        });
    }
    loss(X) {
        const model = this.assertModel(MODEL);
        const X_hat = model.predict(X);
        return tf.losses.meanSquaredError(X, X_hat);
    }
    _train(X, Y, o) {
        return __awaiter(this, void 0, void 0, function* () {
            const model = this.assertModel(MODEL);
            const optimizer = this.registerOptimizer('opt', () => new Optimizer_1.Optimizer(o));
            model.compile({
                optimizer: optimizer.getTfOptimizer(),
                loss: 'meanSquaredError',
            });
            const history = yield optimizer.fit(model, X, X, {
                batchSize: X.shape[0],
                epochs: o.iterations,
                shuffle: false,
            });
            // we've finished optimizing, so we can release our optimizer
            this.clearOptimizer('opt');
            return History_1.History.fromTensorflowHistory(this.name, this.opts, history);
        });
    }
    _predict() {
        return __awaiter(this, void 0, void 0, function* () { throw new Error('Predict not implemented for MatrixFactorization'); });
    }
    static fromSavedState(location) {
        return __awaiter(this, void 0, void 0, function* () {
            return new MatrixFactorization({}).loadFromDisk(location);
        });
    }
    get D() {
        const model = this.assertModel(MODEL);
        return model.getLayer(DictLayer.name).getWeights()[0];
    }
    get H() {
        const model = this.assertModel(MODEL);
        return model.getLayer(DictLayer.name).getWeights()[1];
    }
    setD(tensor) {
        const model = this.assertModel(MODEL);
        model.getLayer(DictLayer.name).setWeights([tensor, this.H]);
    }
}
exports.MatrixFactorization = MatrixFactorization;
exports.MatrixFactorizationMetaParametersSchema = v.object({
    regularizerD: regularizers_1.RegularizerParametersSchema,
    regularizerH: regularizers_1.RegularizerParametersSchema,
    hidden: v.number(),
});
//# sourceMappingURL=MatrixFactorization.js.map