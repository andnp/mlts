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
const tensorflow_1 = require("../utils/tensorflow");
const regularizers_1 = require("../regularizers/regularizers");
exports.SupervisedDictionaryLearningMetaParameterSchema = v.object({
    regularizer: regularizers_1.RegularizerParametersSchema,
    hidden: v.number(),
});
class SupervisedDictionaryLearning extends Algorithm_1.Algorithm {
    constructor(datasetDescription, opts, saveLocation = 'savedModels') {
        super(datasetDescription, saveLocation);
        this.datasetDescription = datasetDescription;
        this.name = SupervisedDictionaryLearning.name;
        this.loss = tensorflow_1.autoDispose((X, Y) => {
            const Y_hat = tf.sigmoid(tf.matMul(this.W, this.H));
            const X_hat = tf.matMul(this.D, this.H);
            const y_loss = tf.losses.sigmoidCrossEntropy(Y.transpose(), Y_hat);
            const x_loss = tf.losses.meanSquaredError(X.transpose(), X_hat);
            const reg = regularizers_1.regularize(this.opts.regularizer, this.W);
            return y_loss.add(x_loss).add(reg);
        });
        this.opts = _.merge({
            regularizer: { type: 'l1', weight: 0 },
            hidden: 2,
        }, opts);
    }
    _build() {
        return __awaiter(this, void 0, void 0, function* () {
            this.registerParameter('W', () => tensorflow_1.randomInitVariable([this.datasetDescription.classes, this.opts.hidden]));
            this.registerParameter('H', () => tensorflow_1.randomInitVariable([this.opts.hidden, this.datasetDescription.samples]));
            this.registerParameter('D', () => tensorflow_1.randomInitVariable([this.datasetDescription.features, this.opts.hidden]));
        });
    }
    _train(X, Y, o) {
        return __awaiter(this, void 0, void 0, function* () {
            const optimizer = this.registerOptimizer('opt', () => new Optimizer_1.Optimizer(this.getDefaultOptimizerParameters(o)));
            const { W, D, H } = this.assertParametersExist(['W', 'H', 'D']);
            return optimizer.minimize(_.partial(this.loss, X, Y), [W, D, H]);
        });
    }
    _predict(X, o) {
        return __awaiter(this, void 0, void 0, function* () {
            const optimizer = new Optimizer_1.Optimizer(this.getDefaultOptimizerParameters(o));
            const H_test = (X.shape[0] === this.datasetDescription.samples)
                ? this.H
                : tensorflow_1.randomInitVariable([this.opts.hidden, X.shape[0]]);
            yield optimizer.minimize(() => {
                const X_hat = tf.matMul(this.D, H_test);
                return tf.losses.meanSquaredError(X.transpose(), X_hat);
            }, [H_test]);
            return tf.tidy(() => {
                return tf.sigmoid(tf.matMul(this.W, H_test)).transpose();
            });
        });
    }
    getDefaultOptimizerParameters(o) {
        return _.merge({
            iterations: 1000,
            type: 'adadelta',
            learningRate: 1.0,
        }, o);
    }
    static fromSavedState(location) {
        return __awaiter(this, void 0, void 0, function* () {
            return new SupervisedDictionaryLearning({}).loadFromDisk(location);
        });
    }
    get W() { return this.assertParametersExist(['W']).W; }
    get H() { return this.assertParametersExist(['H']).H; }
    get D() { return this.assertParametersExist(['D']).D; }
}
exports.SupervisedDictionaryLearning = SupervisedDictionaryLearning;
//# sourceMappingURL=SupervisedDictionaryLearning.js.map