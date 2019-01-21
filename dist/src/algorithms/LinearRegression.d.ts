import * as tf from '@tensorflow/tfjs';
import * as v from 'validtyped';
import { SupervisedAlgorithm } from "../algorithms/Algorithm";
import { SupervisedDatasetDescription } from '../data/DatasetDescription';
import { OptimizationParameters } from '../optimization/OptimizerSchemas';
export declare const LinearRegressionMetaParameterSchema: v.Validator<import("simplytyped").ObjectType<{
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
export declare class LinearRegression extends SupervisedAlgorithm {
    protected datasetDescription: SupervisedDatasetDescription;
    protected readonly name: string;
    protected readonly opts: LinearRegressionMetaParameters;
    readonly model: tf.Model;
    constructor(datasetDescription: SupervisedDatasetDescription, opts?: Partial<LinearRegressionMetaParameters>);
    protected _train(X: tf.Tensor2D, Y: tf.Tensor2D, opts?: Partial<OptimizationParameters>): Promise<tf.History>;
    loss(X: tf.Tensor2D, Y: tf.Tensor2D): tf.Tensor<tf.Rank>;
    protected _predict(X: tf.Tensor2D): Promise<tf.Tensor<tf.Rank.R2>>;
    W: tf.Tensor2D;
    private getDefaultOptimizationParameters;
}
