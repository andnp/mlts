import * as tf from '@tensorflow/tfjs';
import { OptimizationParameters } from './OptimizerSchemas';
import { DeepPartial } from 'simplytyped';
export interface OptimizationOptions {
    printProgress: boolean;
}
export declare function getDefaultParameters(opt?: DeepPartial<OptimizationParameters>): OptimizationParameters;
export declare function getDefaultOptions(opt?: Partial<OptimizationOptions>): OptimizationOptions;
export declare function getTfOptimizer(opt?: OptimizationParameters): tf.AdadeltaOptimizer | tf.AdagradOptimizer | tf.RMSPropOptimizer;
export declare function minimize(lossFunc: () => tf.Tensor<tf.Rank.R0>, params?: OptimizationParameters, vars?: tf.Variable[], opt?: Partial<OptimizationOptions>): Promise<number[]>;
export declare function fit(model: tf.Model, X: tf.Tensor | tf.Tensor[], Y: tf.Tensor | tf.Tensor[], params: tf.ModelFitConfig): Promise<tf.History>;
