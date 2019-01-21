import * as tf from '@tensorflow/tfjs';
import * as v from 'validtyped';
import { SupervisedAlgorithm } from "../algorithms/Algorithm";
import { SupervisedDatasetDescription } from '../data/DatasetDescription';
import { RepresentationAlgorithm } from '../algorithms/interfaces/RepresentationAlgorithm';
import { OptimizationParameters } from '../optimization/OptimizerSchemas';
export declare const SupervisedAutoencoderMetaParameterSchema: v.Validator<v.ObjectValidator<{
    layers: v.Validator<import("simplytyped").ObjectType<{
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
        activation: v.Validator<"linear" | "relu" | "elu" | "sigmoid" | "tanh">;
        type: v.Validator<"dense">;
        name: v.Validator<string>;
    }>, "type" | "units" | "activation">>[]>;
}>>;
export declare type SupervisedAutoencoderMetaParameters = v.ValidType<typeof SupervisedAutoencoderMetaParameterSchema>;
export declare class SupervisedAutoencoder extends SupervisedAlgorithm implements RepresentationAlgorithm {
    protected datasetDescription: SupervisedDatasetDescription;
    protected readonly name: string;
    protected readonly opts: SupervisedAutoencoderMetaParameters;
    readonly model: tf.Model;
    protected representationLayer: tf.SymbolicTensor | undefined;
    protected inputs: tf.SymbolicTensor | undefined;
    constructor(datasetDescription: SupervisedDatasetDescription, opts?: Partial<SupervisedAutoencoderMetaParameters>);
    protected _train(X: tf.Tensor2D, Y: tf.Tensor2D, opts?: OptimizationParameters): Promise<tf.History>;
    getRepresentation(X: tf.Tensor2D): Promise<tf.Tensor<tf.Rank.R2>>;
    protected _predict(X: tf.Tensor2D): Promise<tf.Tensor<tf.Rank.R2>>;
}
