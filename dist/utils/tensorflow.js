"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const tf = require("@tensorflow/tfjs");
const Data_1 = require("data/Data");
const matrix_1 = require("./matrix");
function autoDispose(f) {
    const g = (...args) => {
        return tf.tidy(() => {
            return f(...args);
        });
    };
    return g;
}
exports.autoDispose = autoDispose;
exports.oneHotDataset = autoDispose((dataset) => {
    const [X, Y] = dataset.train;
    const [T, TY] = dataset.test;
    const transformedY = matrix_1.Matrix.fromArray(Y.rows, 1, tf.oneHot(_.flatten(Y.raw), 10).dataSync());
    const transformedTY = matrix_1.Matrix.fromArray(TY.rows, 1, tf.oneHot(_.flatten(TY.raw), 10).dataSync());
    return new Data_1.Data(X, transformedY, T, transformedTY);
});
exports.transposeDataset = autoDispose((dataset) => {
    const data = dataset.train.concat(dataset.test);
    const transposed = data.map(d => tf.tensor2d(d.raw, [d.rows, d.cols]).transpose());
    return {
        train: [transposed[0], transposed[1]],
        test: [transposed[2], transposed[3]],
    };
});
//# sourceMappingURL=tensorflow.js.map