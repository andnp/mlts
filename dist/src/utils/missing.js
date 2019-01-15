"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tf = require("@tensorflow/tfjs");
const _ = require("lodash");
const utilities_ts_1 = require("utilities-ts");
const transformations_1 = require("../transformations");
const data_1 = require("../data");
exports.MISSING_VALUE = -222.222;
function whereMissing(X, t, f) {
    return tf.tidy(() => tf.where(X.equal(tf.scalar(exports.MISSING_VALUE)), t, f));
}
exports.whereMissing = whereMissing;
function applyMissingMask(X, m) {
    return tf.tidy(() => {
        const offset = tf.onesLike(m).sub(m).mul(tf.scalar(exports.MISSING_VALUE));
        return X.mul(m).add(offset);
    });
}
exports.applyMissingMask = applyMissingMask;
function createMissingMask(X) {
    return tf.tidy(() => whereMissing(X, tf.zerosLike(X), tf.onesLike(X)));
}
exports.createMissingMask = createMissingMask;
function missingToZeros(X) {
    return tf.tidy(() => whereMissing(X, tf.zerosLike(X), X));
}
exports.missingToZeros = missingToZeros;
class MissingMaskLayer extends tf.layers.Layer {
    call(inputs) {
        return tf.tidy(() => {
            const input = utilities_ts_1.arrays.getFirst(inputs);
            return missingToZeros(input);
        });
    }
    getConfig() {
        return {};
    }
}
MissingMaskLayer.className = MissingMaskLayer.name;
exports.MissingMaskLayer = MissingMaskLayer;
tf.serialization.registerClass(MissingMaskLayer);
class RandomMissingTransformation extends transformations_1.Transformation {
    constructor(rate) {
        super();
        this.rate = rate;
    }
    async transformTensor(X) {
        const mask = tf.where(tf.randomUniform(X.shape, 0, 1).lessEqual(tf.scalar(this.rate)), tf.zerosLike(X), tf.onesLike(X));
        return applyMissingMask(X, mask);
    }
}
exports.RandomMissingTransformation = RandomMissingTransformation;
class RandomMissingTargets extends transformations_1.Transformation {
    constructor(rate) {
        super();
        this.rate = rate;
    }
    async applyTransformation(data) {
        const [X, Y] = data.train;
        const [T, TY] = data.test;
        return new data_1.TensorflowDataset(X, await this.transformTensor(Y), T, TY);
    }
    async transformTensor(X) {
        const [rows, cols] = X.shape;
        const mask_row = tf.where(tf.randomUniform([rows], 0, 1).lessEqual(tf.scalar(this.rate)), tf.zeros([rows]), tf.ones([rows])).as2D(rows, 1);
        const mask = tf.concat2d(_.times(cols, () => mask_row), 1);
        return applyMissingMask(X, mask);
    }
}
exports.RandomMissingTargets = RandomMissingTargets;
//# sourceMappingURL=missing.js.map