import * as tf from '@tensorflow/tfjs';
import * as v from 'validtyped';
import { SupervisedAlgorithm } from "../algorithms/Algorithm";
import { SupervisedDatasetDescription } from '../data/DatasetDescription';
import { OptimizationParameters } from '../optimization/OptimizerSchemas';
export declare const ANNMetaParameterSchema: v.Validator<import("simplytyped/types/objects").ObjectType<{
    loss?: "meanSquaredError" | "binaryCrossentropy" | undefined;
} & Pick<v.ObjectValidator<{
    layers: v.Validator<import("simplytyped/types/objects").ObjectType<{
        name?: string | undefined;
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
        units: v.Validator<number>;
        activation: v.Validator<"linear" | "elu" | "relu" | "sigmoid" | "tanh">;
        type: v.Validator<"dense">;
        name: v.Validator<string>;
    }>, "type" | "units" | "activation">>[]>;
    loss: v.Validator<"meanSquaredError" | "binaryCrossentropy">;
}>, "layers">>>;
export declare type ANNMetaParameters = v.ValidType<typeof ANNMetaParameterSchema>;
export declare class ANN extends SupervisedAlgorithm {
    protected datasetDescription: SupervisedDatasetDescription;
    protected readonly name: string;
    protected readonly opts: ANNMetaParameters;
    readonly model: tf.Model;
    constructor(datasetDescription: SupervisedDatasetDescription, opts?: Partial<ANNMetaParameters>);
    summary(): void;
    protected _train(X: tf.Tensor2D, Y: tf.Tensor2D, opts?: Partial<OptimizationParameters>): Promise<tf.History>;
    loss(X: tf.Tensor2D, Y: tf.Tensor2D): tf.Tensor<tf.Rank>;
    protected _predict(X: tf.Tensor2D): Promise<tf.Tensor<tf.Rank.R2>>;
    private getDefaultOptimizationParameters;
    static fromANN(ann: ANN, opts?: Partial<FromANNOptions>): Promise<ANN>;
}
interface FromANNOptions {
    keepWeights: boolean;
    newOutputSize: number;
    retrain: boolean;
}
export {};
