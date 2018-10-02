import * as v from 'validtyped';
import * as tf from '@tensorflow/tfjs';
import { Transformation } from '../transformations/Transformation';
import { TensorflowDataset } from '../data/tensorflow/TensorflowDataset';
export declare class GaussianKernelTransformation extends Transformation {
    private params;
    constructor(params: GaussianKernelParameters);
    applyTransformation(data: TensorflowDataset): Promise<TensorflowDataset>;
    transformTensor(X: tf.Tensor2D): Promise<tf.Tensor<tf.Rank.R2>>;
}
export declare const GaussianKernelParametersSchema: v.Validator<import("simplytyped/types/objects").ObjectType<{
    overlap?: number | undefined;
} & Pick<v.ObjectValidator<{
    type: v.Validator<"GaussianKernel">;
    centers: v.Validator<number>;
    overlap: v.Validator<number>;
}>, "type" | "centers">>>;
export declare type GaussianKernelParameters = v.ValidType<typeof GaussianKernelParametersSchema>;
