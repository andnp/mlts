import * as tf from '@tensorflow/tfjs';
import * as v from 'validtyped';
import { UnsupervisedAlgorithm } from "../algorithms/Algorithm";
import { MatrixFactorizationDatasetDescription } from '../data/DatasetDescription';
import { OptimizationParameters } from '../optimization/OptimizerSchemas';
export declare class MatrixFactorization extends UnsupervisedAlgorithm {
    protected datasetDescription: MatrixFactorizationDatasetDescription;
    protected readonly name: string;
    protected opts: MatrixFactorizationMetaParameters;
    d: tf.Variable<tf.Rank.R2>;
    h: tf.Variable<tf.Rank.R2>;
    private getDefaults;
    constructor(datasetDescription: MatrixFactorizationDatasetDescription, opts?: Partial<MatrixFactorizationMetaParameters>);
    loss(X: tf.Tensor2D, H: tf.Tensor2D, D: tf.Tensor2D, mask: tf.Tensor2D): tf.Tensor<tf.Rank.R0>;
    private buildMask;
    protected _train(X: tf.Tensor2D, o: OptimizationParameters): Promise<import("../analysis/History").History>;
    protected _predict(X: tf.Tensor2D, o: OptimizationParameters): Promise<tf.Tensor2D>;
    readonly D: tf.Variable<tf.Rank.R2>;
    readonly H: tf.Variable<tf.Rank.R2>;
    setD(tensor: tf.Tensor2D): void;
}
export declare const MatrixFactorizationMetaParametersSchema: v.Validator<import("simplytyped/types/objects").ObjectType<{
    regularizerD?: v.ObjectValidator<{
        type: v.Validator<"l1">;
        weight: v.Validator<number>;
    }> | v.ObjectValidator<{
        type: v.Validator<"l2">;
        weight: v.Validator<number>;
    }> | undefined;
    regularizerH?: v.ObjectValidator<{
        type: v.Validator<"l1">;
        weight: v.Validator<number>;
    }> | v.ObjectValidator<{
        type: v.Validator<"l2">;
        weight: v.Validator<number>;
    }> | undefined;
    useMissingMask?: boolean | undefined;
} & Pick<v.ObjectValidator<{
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
    useMissingMask: v.Validator<boolean>;
}>, "hidden">>>;
export declare type MatrixFactorizationMetaParameters = v.ValidType<typeof MatrixFactorizationMetaParametersSchema>;
