import * as tf from '@tensorflow/tfjs';
import * as v from 'validtyped';
import { Algorithm } from "../algorithms/Algorithm";
import { SupervisedDatasetDescription } from '../data/DatasetDescription';
import { History } from '../analysis/History';
import { OptimizationParameters } from '../optimization/OptimizerSchemas';
export declare const LinearRegressionMetaParameterSchema: v.Validator<import("simplytyped/types/objects").ObjectType<{
    regularizer?: v.ObjectValidator<{
        type: v.Validator<"l1">;
        weight: v.Validator<number>;
    }> | v.ObjectValidator<{
        type: v.Validator<"l2">;
        weight: v.Validator<number>;
    }> | undefined;
    initialParameters?: v.ObjectValidator<{
        mean: v.Validator<number>;
        stddev: v.Validator<number>;
    }> | undefined;
} & Pick<v.ObjectValidator<{
    regularizer: v.Validator<v.ObjectValidator<{
        type: v.Validator<"l1">;
        weight: v.Validator<number>;
    }> | v.ObjectValidator<{
        type: v.Validator<"l2">;
        weight: v.Validator<number>;
    }>>;
    initialParameters: v.Validator<v.ObjectValidator<{
        mean: v.Validator<number>;
        stddev: v.Validator<number>;
    }>>;
}>, never>>>;
export declare type LinearRegressionMetaParameters = v.ValidType<typeof LinearRegressionMetaParameterSchema>;
export declare class LinearRegression extends Algorithm {
    protected datasetDescription: SupervisedDatasetDescription;
    protected readonly name: string;
    protected readonly opts: LinearRegressionMetaParameters;
    constructor(datasetDescription: SupervisedDatasetDescription, opts?: Partial<LinearRegressionMetaParameters>, saveLocation?: string);
    protected _build(): Promise<void>;
    protected _train(X: tf.Tensor2D, Y: tf.Tensor2D, opts?: Partial<OptimizationParameters>): Promise<History>;
    loss(X: tf.Tensor2D, Y: tf.Tensor2D): tf.Tensor<tf.Rank>;
    protected _predict(X: tf.Tensor2D): Promise<tf.Tensor<tf.Rank.R2>>;
    static fromSavedState(location: string): Promise<LinearRegression>;
    W: tf.Tensor2D;
    private getDefaultOptimizationParameters;
}
