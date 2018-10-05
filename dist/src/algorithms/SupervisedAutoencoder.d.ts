import * as tf from '@tensorflow/tfjs';
import * as v from 'validtyped';
import { Algorithm } from "../algorithms/Algorithm";
import { SupervisedDatasetDescription } from '../data/DatasetDescription';
import { History } from '../analysis/History';
import { RepresentationAlgorithm } from '../algorithms/interfaces/RepresentationAlgorithm';
import { OptimizationParameters } from '../optimization/OptimizerSchemas';
export declare const SupervisedAutoencoderMetaParameterSchema: v.Validator<v.ObjectValidator<{
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
        activation: v.Validator<"elu" | "linear" | "relu" | "sigmoid" | "tanh">;
        type: v.Validator<"dense">;
        name: v.Validator<string>;
    }>, "type" | "units" | "activation">>[]>;
}>>;
export declare type SupervisedAutoencoderMetaParameters = v.ValidType<typeof SupervisedAutoencoderMetaParameterSchema>;
export declare class SupervisedAutoencoder extends Algorithm implements RepresentationAlgorithm {
    protected datasetDescription: SupervisedDatasetDescription;
    protected readonly name: string;
    protected readonly opts: SupervisedAutoencoderMetaParameters;
    protected representationLayer: tf.SymbolicTensor | undefined;
    protected inputs: tf.SymbolicTensor | undefined;
    constructor(datasetDescription: SupervisedDatasetDescription, opts?: Partial<SupervisedAutoencoderMetaParameters>, saveLocation?: string);
    protected _build(): Promise<void>;
    protected _train(X: tf.Tensor2D, Y: tf.Tensor2D, opts?: Partial<OptimizationParameters>): Promise<History>;
    loss(X: tf.Tensor2D, Y: tf.Tensor2D): tf.Tensor<tf.Rank>;
    getRepresentation(X: tf.Tensor2D): Promise<tf.Tensor<tf.Rank.R2>>;
    reconstructionLoss(X: tf.Tensor2D): number;
    protected _predict(X: tf.Tensor2D): Promise<tf.Tensor<tf.Rank.R2>>;
    static fromSavedState(location: string): Promise<SupervisedAutoencoder>;
    private getDefaultOptimizationParameters;
}
