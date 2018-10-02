"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tf = require("@tensorflow/tfjs");
function meanSquaredError(Y_hat, Y) {
    return tf.mean(Y_hat.squaredDifference(Y));
}
exports.meanSquaredError = meanSquaredError;
//# sourceMappingURL=regression.js.map