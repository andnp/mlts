"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const tf = require("@tensorflow/tfjs");
const printer_1 = require("utils/printer");
const tensorflow_1 = require("utils/tensorflow");
class TwoStageDictionaryLearning {
    constructor(features, classes, hidden, samples, opts) {
        this.features = features;
        this.classes = classes;
        this.hidden = hidden;
        this.samples = samples;
        this.opts = _.merge({
            stage1: {}
        }, opts);
        this.stage1 = new DictLayer(this.features, this.hidden, this.samples, this.opts.stage1);
        this.stage2 = new WeightLayer(this.classes, this.hidden, this.samples);
    }
    getDefaults(opts) {
        return _.merge({
            learningRate: 2.0,
            iterations: 10,
        }, opts);
    }
    loss(X, Y) {
        const s1_loss = this.stage1.loss(X);
        const s2_loss = this.stage2.loss(Y);
        return s1_loss.add(s2_loss);
    }
    train(X, Y, opts) {
        const o = this.getDefaults(opts);
        this.stage1.train(X, Object.assign({}, o, { trainDictionary: true }));
        this.stage2.setH(this.stage1.H);
        this.stage2.train(Y, o);
    }
    predict(T, opts) {
        const o = this.getDefaults(opts);
        const stage3 = new DictLayer(T.shape[0], this.hidden, T.shape[1]);
        stage3.train(T, Object.assign({}, o, { trainDictionary: false }));
        const Y_hat = this.stage2.predict(stage3.H);
        return Y_hat;
    }
}
exports.TwoStageDictionaryLearning = TwoStageDictionaryLearning;
class DictLayer {
    constructor(features, hidden, samples, opts) {
        this.features = features;
        this.hidden = hidden;
        this.samples = samples;
        this._D = tf.variable(tf.randomNormal([this.features, this.hidden]));
        this._H = tf.variable(tf.randomNormal([this.hidden, this.samples]));
        this.loss = tensorflow_1.autoDispose((X) => {
            const X_hat = tf.matMul(this.D, this.H);
            const mse = tf.losses.meanSquaredError(X, X_hat);
            const regD = tf.norm(this.D, 1).mul(tf.tensor(this.opts.regD));
            const loss = mse.add(regD);
            return loss;
        });
        this.opts = this.getDefaults(opts);
    }
    getDefaults(opts) {
        return _.merge({
            regularizer: 'l1',
            regD: 0,
        }, opts);
    }
    train(X, o) {
        const optimizer = tf.train.adadelta(o.learningRate);
        const varList = o.trainDictionary
            ? [this.D, this.H]
            : [this.H];
        printer_1.printProgress(printer => {
            for (let i = 0; i < o.iterations; ++i) {
                const lossTensor = optimizer.minimize(_.partial(this.loss, X, o), 
                /* return cost */ true, varList);
                const loss = lossTensor.get();
                if (i % 20 === 0)
                    printer(loss);
            }
        });
    }
    get D() { return this._D; }
    get H() { return this._H; }
}
class WeightLayer {
    constructor(classes, hidden, samples) {
        this.classes = classes;
        this.hidden = hidden;
        this.samples = samples;
        this._W = tf.variable(tf.randomNormal([this.classes, this.hidden]));
        this._H = tf.variable(tf.randomNormal([this.hidden, this.samples]));
        this.loss = tensorflow_1.autoDispose((Y) => {
            const Y_hat = this.predict(this.H);
            const loss = tf.losses.sigmoidCrossEntropy(Y, Y_hat);
            return loss;
        });
    }
    train(Y, o) {
        const optimizer = tf.train.adadelta(o.learningRate);
        printer_1.printProgress(printer => {
            for (let i = 0; i < o.iterations; ++i) {
                const lossTensor = optimizer.minimize(_.partial(this.loss, Y), 
                /* return cost */ true, 
                /* var list */ [this.W]);
                const loss = lossTensor.get();
                printer(loss);
            }
        });
    }
    predict(H) {
        return tf.sigmoid(tf.matMul(this.W, H));
    }
    get W() { return this._W; }
    get H() { return this._H; }
    setW(W) {
        this._W.assign(W.as2D(this.classes, this.hidden));
        return this;
    }
    setH(H) {
        this._H.assign(H.as2D(this.hidden, this.samples));
        return this;
    }
}
//# sourceMappingURL=TwoStageDictionaryLearning.js.map