import * as tf from '@tensorflow/tfjs';
import * as v from 'validtyped';
import { UnsupervisedAlgorithm } from "../algorithms/Algorithm";
import { MatrixFactorizationDatasetDescription } from '../data/DatasetDescription';
import { OptimizationParameters } from '../optimization/OptimizerSchemas';
export declare class MatrixFactorization extends UnsupervisedAlgorithm {
    protected datasetDescription: MatrixFactorizationDatasetDescription;
    protected readonly name: string;
    readonly model: tf.Model;
    protected opts: MatrixFactorizationMetaParameters;
    private getDefaults;
    constructor(datasetDescription: MatrixFactorizationDatasetDescription, opts?: Partial<MatrixFactorizationMetaParameters>);
    loss(X: tf.Tensor2D): tf.Tensor<tf.Rank>;
    protected _train(X: tf.Tensor2D, o: OptimizationParameters): Promise<tf.History>;
    protected _predict(): Promise<tf.Tensor2D>;
    readonly D: tf.Tensor<tf.Rank.R2>;
    readonly H: tf.Tensor<tf.Rank.R2>;
    setD(tensor: tf.Tensor2D): void;
}
export declare const MatrixFactorizationMetaParametersSchema: v.Validator<v.ObjectValidator<{
    regularizerD: v.Validator<v.ObjectValidator<{
        type: v.Validator<"l1">;
        weight: v.Validator<number>;
    }> | v.ObjectValidator<{
        type: v.Validator<"l2">;
        weight: v.Validator<number>;
    }>>;
    regularizerH: v.Validator<v.ObjectValidator<{
        type: v.Validator<"l1">;
        weight: v.Validator<number>;
    }> | v.ObjectValidator<{
        type: v.Validator<"l2">;
        weight: v.Validator<number>;
    }>>;
    hidden: v.Validator<number>;
}>>;
export declare type MatrixFactorizationMetaParameters = v.ValidType<typeof MatrixFactorizationMetaParametersSchema>;
