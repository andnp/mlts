import * as tf from '@tensorflow/tfjs';
import { Algorithm } from '../Algorithm';
export interface RepresentationAlgorithm extends Algorithm {
    getRepresentation(X: tf.Tensor2D, options?: {}): Promise<tf.Tensor2D>;
}
export declare function isRepresentationAlgorithm(x: Algorithm | RepresentationAlgorithm): x is RepresentationAlgorithm;
