import * as tf from '@tensorflow/tfjs';
import * as v from 'validtyped';
import { Algorithm } from "../algorithms/Algorithm";
import { SupervisedDatasetDescription } from '../data/DatasetDescription';
import { History } from '../analysis/History';
import { OptimizationParameters } from '../optimization/OptimizerSchemas';
export declare const ANNMetaParameterSchema: v.Validator<import("simplytyped/types/objects").ObjectType<{
    loss?: "categoricalCrossentropy" | "meanSquaredError" | undefined;
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
        activation: v.Validator<"sigmoid" | "linear" | "relu" | "tanh" | "elu">;
        type: v.Validator<"dense">;
        name: v.Validator<string>;
    }>, "type" | "units" | "activation">>[]>;
    loss: v.Validator<"categoricalCrossentropy" | "meanSquaredError">;
}>, "layers">>>;
export declare type ANNMetaParameters = v.ValidType<typeof ANNMetaParameterSchema>;
export declare class ANN extends Algorithm {
    protected datasetDescription: SupervisedDatasetDescription;
    protected readonly name: string;
    protected readonly opts: ANNMetaParameters;
    constructor(datasetDescription: SupervisedDatasetDescription, opts?: Partial<ANNMetaParameters>, saveLocation?: string);
    protected _build(): Promise<void>;
    summary(): void;
    protected _train(X: tf.Tensor2D, Y: tf.Tensor2D, opts?: Partial<OptimizationParameters>): Promise<History>;
    loss(X: tf.Tensor2D, Y: tf.Tensor2D): tf.Tensor<tf.Rank>;
    protected _predict(X: tf.Tensor2D): Promise<tf.Tensor<tf.Rank.R2>>;
    static fromSavedState(location: string): Promise<ANN>;
    private getDefaultOptimizationParameters;
    static fromANN(ann: ANN, opts?: Partial<FromANNOptions>): Promise<ANN>;
}
interface FromANNOptions {
    keepWeights: boolean;
    newOutputSize: number;
    retrain: boolean;
}
export {};
