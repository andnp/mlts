import * as tf from '@tensorflow/tfjs';

import { TensorflowDataset } from "../data/tensorflow/TensorflowDataset";

export abstract class Transformation {
    abstract transformTensor(data: tf.Tensor2D): Promise<tf.Tensor2D>;

    async applyTransformation(data: TensorflowDataset) {
        const [X, Y] = data.train;
        const [T, TY] = data.test;

        const transformed_X = await this.transformTensor(X);
        const transformed_T = await this.transformTensor(T);

        return new TensorflowDataset(transformed_X, Y, transformed_T, TY);
    }
}
