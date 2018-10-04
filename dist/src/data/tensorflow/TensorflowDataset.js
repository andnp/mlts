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
const utilities_ts_1 = require("utilities-ts");
const _ = require("lodash");
const tf = require("@tensorflow/tfjs");
const tfUtil = require("../../utils/tensorflow");
const random = require("../../utils/random");
// TODO: consider that not all datasets will necessarily have in-sample and out-sample data
class TensorflowDataset {
    constructor(_x, _y, _t, _ty) {
        this._x = _x;
        this._y = _y;
        this._t = _t;
        this._ty = _ty;
        this.shouldStratify = false;
        this.transpose = tfUtil.autoDispose(() => {
            this._x = this._x.transpose();
            this._y = this._y.transpose();
            this._t = this._t.transpose();
            this._ty = this._ty.transpose();
            return this;
        });
        this.oneHot = tfUtil.autoDispose((depth) => {
            if (this._y.shape[1] !== 1)
                throw new Error('Expected Y to have only one column');
            if (this._ty.shape[1] !== 1)
                throw new Error('Expected TY to have only one column');
            this._y = tf.oneHot(this._y.asType('int32').as1D(), depth).asType('float32');
            this._ty = tf.oneHot(this._ty.asType('int32').as1D(), depth).asType('float32');
            return this;
        });
        this.scaleColumns = tfUtil.autoDispose(() => {
            const joint = tf.concat([this._x, this._t]);
            const max = tf.max(joint, 0);
            const min = tf.min(joint, 0);
            const minMaxScale = (x) => tf.div(tf.sub(x, min), tf.sub(max, min));
            this._x = minMaxScale(this._x);
            this._t = minMaxScale(this._t);
            return this;
        });
        this.scaleByConstant = tfUtil.autoDispose((constant) => {
            this._x = this._x.asType('float32').div(tf.scalar(constant, 'float32'));
            this._t = this._t.asType('float32').div(tf.scalar(constant, 'float32'));
            return this;
        });
        this.roundRobin = tfUtil.autoDispose(() => {
            const classBins = _.times(this.classes, () => []);
            const samples = this._x.shape[0];
            for (let i = 0; i < samples; ++i) {
                const x = this._x.slice(i, 1);
                const y = this._y.slice(i, 1);
                const c = tf.argMax(y, 1).get(0);
                classBins[c].push([x, y]);
            }
            const X = [];
            const Y = [];
            for (let i = 0; i < samples; ++i) {
                let c = i % this.classes;
                if (classBins[c].length === 0) {
                    for (let j = 1; j < this.classes; ++j) {
                        const cp = (c + j) % this.classes;
                        if (classBins[cp].length === 0)
                            continue;
                        c = cp;
                        break;
                    }
                }
                const [x, y] = classBins[c].pop();
                X.push(x);
                Y.push(y);
            }
            return utilities_ts_1.tuple(tf.concat2d(X, 0), tf.concat2d(Y, 0));
        });
        this.limitedSamples = this._x.shape[0];
    }
    applyTransformation(transform) {
        return __awaiter(this, void 0, void 0, function* () {
            const newData = yield transform.applyTransformation(this);
            this._x = newData._x;
            this._y = newData._y;
            this._t = newData._t;
            this._ty = newData._ty;
            return this;
        });
    }
    limitSamples(samples) {
        this.limitedSamples = samples;
        return this;
    }
    stratify() {
        this.shouldStratify = true;
        return this;
    }
    shuffle() {
        const indices = random.randomIndices(this._x.shape[0]);
        const x_split = [];
        const y_split = [];
        for (const i of indices) {
            x_split.push(this._x.slice(i, 1));
            y_split.push(this._y.slice(i, 1));
        }
        this._x = tf.concat2d(x_split, 0);
        this._y = tf.concat2d(y_split, 0);
    }
    crossValidate(folds, index) {
        const bins = binSizes(this._x.shape[0], folds);
        const x = this._x.split(bins);
        const y = this._y.split(bins);
        return new TensorflowDataset(tf.concat2d(utilities_ts_1.arrays.leaveOut(x, index), 0), tf.concat2d(utilities_ts_1.arrays.leaveOut(y, index), 0), x[index], y[index]);
    }
    get train() {
        const [X, Y] = this.shouldStratify
            ? this.roundRobin()
            : [this._x, this._y];
        const x = tf.tidy(() => X.slice(0, this.limitedSamples));
        const y = tf.tidy(() => Y.slice(0, this.limitedSamples));
        return utilities_ts_1.tuple(x, y);
    }
    get test() {
        return utilities_ts_1.tuple(this._t, this._ty);
    }
    get features() { return this._x.shape[1]; }
    get samples() { return this.limitedSamples; }
    get classes() { return this._y.shape[1]; }
    get testSamples() { return this._t.shape[0]; }
    description() {
        return {
            samples: this.samples,
            features: this.features,
            classes: this.classes,
            testSamples: this.testSamples,
        };
    }
    static fromDataset(dataset) {
        return new TensorflowDataset(tfUtil.matrixToTensor(dataset.train[0]), tfUtil.matrixToTensor(dataset.train[1]), tfUtil.matrixToTensor(dataset.test[0]), tfUtil.matrixToTensor(dataset.test[1]));
    }
    static load() {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error('Should implement the static "load" method for all datasets extending TensorflowDataset');
        });
    }
}
exports.TensorflowDataset = TensorflowDataset;
function binSizes(t, k) {
    let a = 0;
    return _.times(k, i => {
        if (i === k - 1)
            return t - a;
        const s = Math.floor(t / k);
        a += s;
        return s;
    });
}
//# sourceMappingURL=TensorflowDataset.js.map