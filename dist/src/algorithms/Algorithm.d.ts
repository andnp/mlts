import * as tf from '@tensorflow/tfjs';
import { DatasetDescription, SupervisedDatasetDescription } from '../data/DatasetDescription';
import { History } from '../analysis/History';
import { OptimizationParameters } from '../optimization/OptimizerSchemas';
export declare abstract class Algorithm {
    protected datasetDescription: DatasetDescription;
    protected opts: object;
    protected abstract name: string;
    constructor(datasetDescription: DatasetDescription);
    protected abstract _predict(T: tf.Tensor2D, opts?: Partial<OptimizationParameters>): Promise<tf.Tensor2D>;
    predict(T: tf.Tensor2D, opts?: Partial<OptimizationParameters>): Promise<tf.Tensor2D>;
    getParameters(): Record<string, any>;
}
export declare abstract class SupervisedAlgorithm extends Algorithm {
    protected datasetDescription: SupervisedDatasetDescription;
    constructor(datasetDescription: SupervisedDatasetDescription);
    protected abstract _train(X: tf.Tensor2D, Y: tf.Tensor2D, opts?: Partial<OptimizationParameters>): Promise<History | tf.History>;
    train(X: tf.Tensor2D, Y: tf.Tensor2D, opts?: Partial<OptimizationParameters>): Promise<History>;
}
export declare abstract class UnsupervisedAlgorithm extends Algorithm {
    protected abstract _train(X: tf.Tensor2D, opts?: Partial<OptimizationParameters>): Promise<History | tf.History>;
    train(X: tf.Tensor2D, opts?: Partial<OptimizationParameters>): Promise<History>;
}
