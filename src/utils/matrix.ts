import * as tf from '@tensorflow/tfjs';
import { BufferArray } from 'utils/buffers';

export class Matrix {
    private data: BufferArray;
    private r: number;
    private c: number;

    constructor(rows: number, columns: number, data?: BufferArray) {
        this.c = columns;
        this.r = rows;

        this.data = data || new Float32Array(rows * columns);

        if (this.data.length !== rows * columns) throw new Error(`Expected buffer to be length <${rows * columns}>, got <${this.data.length}>`);
    }

    get(i: number, j: number) {
        return this.data[i * this.c + j];
    }

    static fromTensor(X: tf.Tensor2D): Promise<Matrix> {
        return X.data().then(d => new Matrix(X.shape[0], X.shape[1], d));
    }

    get raw(): BufferArray {
        return this.data;
    }

    get rows() { return this.r; }
    get cols() { return this.c; }
}
