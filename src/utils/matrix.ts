import * as tf from '@tensorflow/tfjs';
import { Matrix as SharedMatrix, BufferConstructor } from 'utilities-ts';
import { BufferType } from 'utilities-ts/src/buffers';

export class Matrix extends SharedMatrix {
    private r: number;
    private c: number;

    constructor(rows: number, cols: number, data?: BufferType) {
        super(getBufferConstructor(data) as Float32ArrayConstructor, { rows, cols }, data as Float32Array);
        this.c = cols;
        this.r = rows;

        this.data = data || new Float32Array(rows * cols);

        if (this.data.length !== rows * cols) throw new Error(`Expected buffer to be length <${rows * cols}>, got <${this.data.length}>`);
    }

    asTensor() {
        return tf.tensor2d(this.data, [this.r, this.c]);
    }

    static fromTensor(X: tf.Tensor2D): Promise<Matrix> {
        return X.data().then(d => new Matrix(X.shape[0], X.shape[1], d));
    }
}

function getBufferConstructor<B extends BufferType>(buffer?: B): BufferConstructor {
    if (buffer instanceof Float32Array) return Float32Array;
    if (buffer instanceof Int32Array) return Int32Array;
    if (buffer instanceof Uint8Array) return Uint8Array;

    return Float32Array;
}
