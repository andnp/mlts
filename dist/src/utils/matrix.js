"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tf = require("@tensorflow/tfjs");
class Matrix {
    constructor(rows, columns, data) {
        this.c = columns;
        this.r = rows;
        this.data = data || new Float32Array(rows * columns);
        if (this.data.length !== rows * columns)
            throw new Error(`Expected buffer to be length <${rows * columns}>, got <${this.data.length}>`);
    }
    get(i, j) {
        return this.data[i * this.c + j];
    }
    set(i, j, v) {
        this.data[i * this.c + j] = v;
    }
    asTensor() {
        return tf.tensor2d(this.data, [this.r, this.c]);
    }
    static fromTensor(X) {
        return X.data().then(d => new Matrix(X.shape[0], X.shape[1], d));
    }
    get raw() {
        return this.data;
    }
    get rows() { return this.r; }
    get cols() { return this.c; }
}
exports.Matrix = Matrix;
//# sourceMappingURL=matrix.js.map