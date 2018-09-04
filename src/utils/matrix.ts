import * as tf from '@tensorflow/tfjs';

export type Buffer = Uint8Array | Int32Array | Float32Array;

export class Matrix {
    private data: Buffer;
    private r: number;
    private c: number;

    constructor(rows: number, columns: number, data: Buffer) {
        this.c = columns;
        this.r = rows;

        if (data.length !== rows * columns) throw new Error(`Expected buffer to be length <${rows * columns}>, got <${data.length}>`);

        this.data = data;
    }

    get(i: number, j: number) {
        return this.data[i * this.c + j];
    }

    static fromTensor(X: tf.Tensor2D): Promise<Matrix> {
        return X.data().then(d => new Matrix(X.shape[0], X.shape[1], d));
    }

    get raw(): Buffer {
        return this.data;
    }

    get rows() { return this.r; }
    get cols() { return this.c; }
}
