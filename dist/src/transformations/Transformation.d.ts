import * as tf from '@tensorflow/tfjs';
import { TensorflowDataset } from "../data/tensorflow/TensorflowDataset";
export declare abstract class Transformation {
    abstract transformTensor(data: tf.Tensor2D): Promise<tf.Tensor2D>;
    applyTransformation(data: TensorflowDataset): Promise<TensorflowDataset>;
}
