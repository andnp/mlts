import * as tf from '@tensorflow/tfjs';
import { Transformation } from '../transformations';
import { TensorflowDataset } from '../data';
export declare const MISSING_VALUE = -222.222;
export declare function whereMissing(X: tf.Tensor2D, t: tf.Tensor2D, f: tf.Tensor2D): tf.Tensor<tf.Rank.R2>;
export declare function applyMissingMask(X: tf.Tensor2D, m: tf.Tensor2D): tf.Tensor<tf.Rank.R2>;
export declare function createMissingMask(X: tf.Tensor2D): tf.Tensor<tf.Rank.R2>;
export declare function missingToZeros(X: tf.Tensor2D): tf.Tensor<tf.Rank.R2>;
export declare class MissingMaskLayer extends tf.layers.Layer {
    static className: string;
    call(inputs: tf.Tensor | tf.Tensor[]): tf.Tensor;
    getConfig(): tf.serialization.ConfigDict;
}
export declare class RandomMissingTransformation extends Transformation {
    private rate;
    constructor(rate: number);
    transformTensor(X: tf.Tensor2D): Promise<tf.Tensor<tf.Rank.R2>>;
}
export declare class RandomMissingTargets extends Transformation {
    private rate;
    constructor(rate: number);
    applyTransformation(data: TensorflowDataset): Promise<TensorflowDataset>;
    transformTensor(X: tf.Tensor2D): Promise<tf.Tensor<tf.Rank.R2>>;
}
