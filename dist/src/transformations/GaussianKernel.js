"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const v = require("validtyped");
const tf = require("@tensorflow/tfjs");
const tfUtils = require("../utils/tensorflow");
const Transformation_1 = require("../transformations/Transformation");
const TensorflowDataset_1 = require("../data/tensorflow/TensorflowDataset");
const matrix_1 = require("../utils/matrix");
class GaussianKernelTransformation extends Transformation_1.Transformation {
    constructor(params) {
        super();
        this.params = params;
    }
    async applyTransformation(data) {
        const [X, Y] = data.train;
        const [T, TY] = data.test;
        const S = tfUtils.randomSamples(X, this.params.centers);
        const overlap = this.params.overlap || 1;
        const bandwidths = getBandwidths(S, overlap);
        const transformed_X = transformGaussian(X, S, bandwidths);
        const transformed_T = transformGaussian(T, S, bandwidths);
        return new TensorflowDataset_1.TensorflowDataset(transformed_X, Y, transformed_T, TY);
    }
    async transformTensor(X) {
        const S = tfUtils.randomSamples(X, this.params.centers);
        const overlap = this.params.overlap || 1;
        const bandwidths = getBandwidths(S, overlap);
        return transformGaussian(X, S, bandwidths);
    }
}
exports.GaussianKernelTransformation = GaussianKernelTransformation;
function transformGaussian(X, C, bandwidths) {
    const centers = C.shape[0];
    const m = new matrix_1.Matrix(X.shape[0], centers);
    for (let i = 0; i < X.shape[0]; ++i) {
        tf.tidy(() => {
            const row = X.slice(i, 1);
            const d = C.sub(row).norm(2, 1);
            const s = tf.mul(bandwidths.pow(tf.tensor(2)), 2.0);
            const n = tf.div(d, s);
            const e = tf.exp(n.neg());
            for (let j = 0; j < centers; ++j) {
                m.set(i, j, e.get(j));
            }
        });
    }
    return m.asTensor();
}
function getBandwidths(X, overlap) {
    const [rows] = X.shape;
    const bandwidths = [];
    for (let i = 0; i < rows; ++i) {
        tf.tidy(() => {
            const row = X.slice(i, 1);
            const distances = X.sub(row).norm(2, 1);
            const { values } = distances.neg().topk(2, true);
            // the absolute closest row is itself.
            // so we get the next closest instead
            const closestValue = values.neg().get(1);
            bandwidths.push(closestValue * overlap);
        });
    }
    return tf.tensor1d(bandwidths);
}
exports.GaussianKernelParametersSchema = v.object({
    type: v.string(['GaussianKernel']),
    centers: v.number(),
    overlap: v.number(),
}, { optional: ['overlap'] });
//# sourceMappingURL=GaussianKernel.js.map