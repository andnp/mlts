import * as tf from '@tensorflow/tfjs';
import { BufferArray } from './buffers';
export declare class Matrix {
    private data;
    private r;
    private c;
    constructor(rows: number, columns: number, data?: BufferArray);
    get(i: number, j: number): number;
    set(i: number, j: number, v: number): void;
    asTensor(): tf.Tensor<tf.Rank.R2>;
    static fromTensor(X: tf.Tensor2D): Promise<Matrix>;
    readonly raw: BufferArray;
    readonly rows: number;
    readonly cols: number;
}
