import * as tf from '@tensorflow/tfjs';
import { Matrix as SharedMatrix } from 'utilities-ts';
import { BufferType } from 'utilities-ts/src/buffers';
export declare class Matrix extends SharedMatrix {
    private r;
    private c;
    constructor(rows: number, cols: number, data?: BufferType);
    asTensor(): tf.Tensor<tf.Rank.R2>;
    static fromTensor(X: tf.Tensor2D): Promise<Matrix>;
}
