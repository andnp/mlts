"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Matrix {
    constructor(data) {
        this.c = data[0].length;
        this.r = data.length;
        data.forEach(row => {
            if (row.length !== this.c)
                throw new Error(`Expected matrix to be rectangular: expected <${this.c}>, got <${row.length}>`);
        });
        this.data = data;
    }
    static fromArray(rows, cols, data) {
        const raw = [];
        for (let i = 0; i < rows; ++i) {
            const row = [];
            for (let j = 0; j < cols; ++j) {
                row.push(data[i * cols + j]);
            }
            raw.push(row);
        }
        return new Matrix(raw);
    }
    static fromTensor(X) {
        return X.data().then(d => Matrix.fromArray(X.shape[0], X.shape[1], d));
    }
    get raw() {
        return this.data;
    }
    get rows() { return this.r; }
    get cols() { return this.c; }
}
exports.Matrix = Matrix;
//# sourceMappingURL=matrix.js.map