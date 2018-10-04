"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tf = require("@tensorflow/tfjs");
const utilities_ts_1 = require("utilities-ts");
class Matrix extends utilities_ts_1.Matrix {
    constructor(rows, cols, data) {
        super(getBufferConstructor(data), { rows, cols }, data);
        this.c = cols;
        this.r = rows;
        this.data = data || new Float32Array(rows * cols);
        if (this.data.length !== rows * cols)
            throw new Error(`Expected buffer to be length <${rows * cols}>, got <${this.data.length}>`);
    }
    asTensor() {
        return tf.tensor2d(this.data, [this.r, this.c]);
    }
    static fromTensor(X) {
        return X.data().then(d => new Matrix(X.shape[0], X.shape[1], d));
    }
}
exports.Matrix = Matrix;
function getBufferConstructor(buffer) {
    if (buffer instanceof Float32Array)
        return Float32Array;
    if (buffer instanceof Int32Array)
        return Int32Array;
    if (buffer instanceof Uint8Array)
        return Uint8Array;
    return Float32Array;
}
//# sourceMappingURL=matrix.js.map