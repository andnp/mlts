"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tf = require("@tensorflow/tfjs");
function getClassificationError(Y_hat, Y) {
    const y_hat = tf.argMax(Y_hat, 1);
    const y = tf.argMax(Y, 1);
    const correct = tf.equal(y_hat, y).sum();
    const total = tf.tensor(y_hat.shape[0]);
    return correct.toFloat().div(total);
}
exports.getClassificationError = getClassificationError;
//# sourceMappingURL=classification.js.map