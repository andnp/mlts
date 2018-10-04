import * as tf from '@tensorflow/tfjs';
import * as v from 'validtyped';
import { DeepPartial } from 'simplytyped';
import { Algorithm } from './Algorithm';
import { OptimizationParameters } from '../optimization/OptimizerSchemas';
import { SupervisedDictionaryLearningDatasetDescription } from '../data/DatasetDescription';
import { History } from '../analysis/History';
import { RepresentationAlgorithm } from '../algorithms/interfaces/RepresentationAlgorithm';
export declare class TwoStageDictionaryLearning extends Algorithm implements RepresentationAlgorithm {
    protected datasetDescription: SupervisedDictionaryLearningDatasetDescription;
    protected readonly name: string;
    private stage1;
    private stage2;
    protected state: {
        activeStage: "complete" | "stage1" | "stage2";
    };
    protected opts: TwoStageDictionaryLearningMetaParameters;
    constructor(datasetDescription: SupervisedDictionaryLearningDatasetDescription, opts?: DeepPartial<TwoStageDictionaryLearningMetaParameters>, saveLocation?: string);
    protected _build(): Promise<void>;
    private getDefaults;
    loss(X: tf.Tensor2D, Y: tf.Tensor2D): tf.Tensor<tf.Rank>;
    protected _train(X: tf.Tensor2D, Y: tf.Tensor2D, opts?: Partial<OptimizationParameters>): Promise<History>;
    protected _predict(T: tf.Tensor2D, opts?: Partial<OptimizationParameters> & {
        useOriginalH?: boolean;
    }): Promise<tf.Tensor<tf.Rank.R2>>;
    getRepresentation(X: tf.Tensor2D, opts?: Partial<OptimizationParameters>): Promise<tf.Tensor<tf.Rank.R2>>;
    protected _saveState(location: string): Promise<string[]>;
    static fromSavedState(location: string): Promise<TwoStageDictionaryLearning>;
}
export declare const TwoStageDictionaryLearningMetaParametersSchema: v.Validator<v.ObjectValidator<{
    stage1: v.Validator<Partial<v.ObjectValidator<{
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
    }>>>;
    stage2: v.Validator<Partial<v.ObjectValidator<{
        regularizer: v.Validator<v.ObjectValidator<{
            type: v.Validator<"l1">;
            weight: v.Validator<number>;
        }> | v.ObjectValidator<{
            type: v.Validator<"l2">;
            weight: v.Validator<number>;
        }>>;
    }>>>;
    hidden: v.Validator<number>;
}>>;
export declare type TwoStageDictionaryLearningMetaParameters = v.ValidType<typeof TwoStageDictionaryLearningMetaParametersSchema>;
