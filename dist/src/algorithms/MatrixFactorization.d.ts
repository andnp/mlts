import * as tf from '@tensorflow/tfjs';
import * as v from 'validtyped';
import { Algorithm } from "../algorithms/Algorithm";
import { MatrixFactorizationDatasetDescription } from '../data/DatasetDescription';
import { History } from '../analysis/History';
import { OptimizationParameters } from '../optimization/OptimizerSchemas';
export declare class MatrixFactorization extends Algorithm {
    protected datasetDescription: MatrixFactorizationDatasetDescription;
    protected readonly name: string;
    protected opts: MatrixFactorizationMetaParameters;
    private getDefaults;
    constructor(datasetDescription: MatrixFactorizationDatasetDescription, opts?: Partial<MatrixFactorizationMetaParameters>, saveLocation?: string);
    protected _build(): Promise<void>;
    loss(X: tf.Tensor2D): tf.Tensor<tf.Rank>;
    protected _train(X: tf.Tensor2D, Y: tf.Tensor2D, o: OptimizationParameters): Promise<History>;
    protected _predict(): Promise<tf.Tensor2D>;
    static fromSavedState(location: string): Promise<MatrixFactorization>;
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
