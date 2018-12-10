import * as tf from '@tensorflow/tfjs';
import * as v from 'validtyped';
import { SupervisedAlgorithm } from "../algorithms/Algorithm";
import { SupervisedDatasetDescription } from '../data/DatasetDescription';
import { OptimizationParameters } from '../optimization/OptimizerSchemas';
export declare const LogisticRegressionMetaParameterSchema: v.Validator<import("simplytyped/types/objects").ObjectType<{
    regularizer?: v.ObjectValidator<{
        type: v.Validator<"l1">;
        weight: v.Validator<number>;
    }> | v.ObjectValidator<{
        type: v.Validator<"l2">;
        weight: v.Validator<number>;
    }> | undefined;
} & Pick<v.ObjectValidator<{
    regularizer: v.Validator<v.ObjectValidator<{
        type: v.Validator<"l1">;
        weight: v.Validator<number>;
    }> | v.ObjectValidator<{
        type: v.Validator<"l2">;
        weight: v.Validator<number>;
    }>>;
}>, never>>>;
export declare type LogisticRegressionMetaParameters = v.ValidType<typeof LogisticRegressionMetaParameterSchema>;
export declare class LogisticRegression extends SupervisedAlgorithm {
    protected datasetDescription: SupervisedDatasetDescription;
    protected readonly name: string;
    protected readonly opts: LogisticRegressionMetaParameters;
    protected model: tf.Model;
    constructor(datasetDescription: SupervisedDatasetDescription, opts?: Partial<LogisticRegressionMetaParameters>);
    protected _train(X: tf.Tensor2D, Y: tf.Tensor2D, opts?: Partial<OptimizationParameters>): Promise<tf.History>;
    loss(X: tf.Tensor2D, Y: tf.Tensor2D): tf.Tensor<tf.Rank>;
    protected _predict(X: tf.Tensor2D): Promise<tf.Tensor<tf.Rank.R2>>;
    readonly W: tf.Tensor<tf.Rank>;
    setW(W: tf.Tensor2D): this;
    private getDefaultOptimizationParameters;
}
