import * as tf from '@tensorflow/tfjs';
import { Algorithm } from '../Algorithm';

export interface RepresentationAlgorithm extends Algorithm {
    getRepresentation(X: tf.Tensor2D, options?: {}): Promise<tf.Tensor2D>;
}

export function isRepresentationAlgorithm(x: Algorithm | RepresentationAlgorithm): x is RepresentationAlgorithm {
    return 'getRepresentation' in x && typeof x.getRepresentation === 'function';
}
