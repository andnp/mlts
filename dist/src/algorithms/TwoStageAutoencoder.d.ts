import * as tf from '@tensorflow/tfjs';
import * as v from 'validtyped';
import { SupervisedAlgorithm } from "../algorithms/Algorithm";
import { SupervisedDatasetDescription } from '../data/DatasetDescription';
import { RepresentationAlgorithm } from '../algorithms/interfaces/RepresentationAlgorithm';
import { OptimizationParameters } from '../optimization/OptimizerSchemas';
export declare const TwoStageAutoencoderMetaParameterSchema: v.Validator<v.ObjectValidator<{
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
    retrainRepresentation: v.Validator<boolean>;
}>>;
export declare type TwoStageAutoencoderMetaParameters = v.ValidType<typeof TwoStageAutoencoderMetaParameterSchema>;
export declare class TwoStageAutoencoder extends SupervisedAlgorithm implements RepresentationAlgorithm {
    protected datasetDescription: SupervisedDatasetDescription;
    protected readonly name: string;
    protected readonly opts: TwoStageAutoencoderMetaParameters;
    readonly model: tf.Model;
    readonly predictionModel: tf.Model;
    protected representationLayer: tf.SymbolicTensor;
    protected inputs: tf.SymbolicTensor;
    constructor(datasetDescription: SupervisedDatasetDescription, opts?: Partial<TwoStageAutoencoderMetaParameters>);
    protected _train(X: tf.Tensor2D, Y: tf.Tensor2D, opts?: Partial<OptimizationParameters>): Promise<tf.History>;
    loss(X: tf.Tensor2D, Y: tf.Tensor2D): tf.Tensor<tf.Rank>;
    getRepresentation(X: tf.Tensor2D): Promise<tf.Tensor<tf.Rank.R2>>;
    reconstructionLoss(X: tf.Tensor2D): number;
    protected _predict(X: tf.Tensor2D): Promise<tf.Tensor<tf.Rank.R2>>;
    private getDefaultOptimizationParameters;
}
