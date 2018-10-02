import * as tf from '@tensorflow/tfjs';
import { History } from '../analysis/History';
import { OptimizationParameters } from './OptimizerSchemas';
export interface OptimizationOptions {
    printProgress: boolean;
}
export declare class Optimizer {
    protected parameters: OptimizationParameters;
    protected opts: OptimizationOptions;
    protected optimizer: tf.Optimizer;
    protected completedIterations: number;
    constructor(parameters: OptimizationParameters, options?: Partial<OptimizationOptions>);
    minimize(lossFunc: () => tf.Tensor<tf.Rank.R0>, vars: tf.Variable[]): Promise<History>;
    private constructOptimizer;
    fit(model: tf.Model, X: tf.Tensor | tf.Tensor[], Y: tf.Tensor | tf.Tensor[], params: tf.ModelFitConfig): Promise<tf.History>;
    saveState(location: string): Promise<void>;
    static fromSavedState(location: string): Promise<Optimizer>;
    getTfOptimizer(): tf.Optimizer;
}
