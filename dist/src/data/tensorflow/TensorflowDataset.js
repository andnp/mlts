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
const tsUtil_1 = require("../../utils/tsUtil");
const tfUtil = require("../../utils/tensorflow");
// TODO: consider that not all datasets will necessarily have in-sample and out-sample data
class TensorflowDataset {
    constructor(_x, _y, _t, _ty) {
        this._x = _x;
        this._y = _y;
        this._t = _t;
        this._ty = _ty;
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
    get train() {
        const x = tf.tidy(() => this._x.slice(0, this.limitedSamples));
        const y = tf.tidy(() => this._y.slice(0, this.limitedSamples));
        return tsUtil_1.tuple(x, y);
    }
    get test() {
        return tsUtil_1.tuple(this._t, this._ty);
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
//# sourceMappingURL=TensorflowDataset.js.map