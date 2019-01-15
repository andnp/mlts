import * as tf from '@tensorflow/tfjs';
import { OptimizationParameters } from '../../optimization';
export interface ReconstructionAlgorithm extends Algorithm {
    reconstruct(X: tf.Tensor2D, opt?: OptimizationParameters): Promise<tf.Tensor2D>;
}
export declare function isReconstructionAlgorithm(alg: Algorithm): alg is ReconstructionAlgorithm;
