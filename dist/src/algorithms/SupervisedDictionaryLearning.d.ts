import * as tf from '@tensorflow/tfjs';
import * as v from 'validtyped';
import { Algorithm } from "../algorithms/Algorithm";
import { SupervisedDictionaryLearningDatasetDescription } from '../data/DatasetDescription';
import { OptimizationParameters } from '../optimization/OptimizerSchemas';
export declare const SupervisedDictionaryLearningMetaParameterSchema: v.Validator<v.ObjectValidator<{
    regularizer: v.Validator<v.ObjectValidator<{
        type: v.Validator<"l1">;
        weight: v.Validator<number>;
    }> | v.ObjectValidator<{
        type: v.Validator<"l2">;
        weight: v.Validator<number>;
    }>>;
    hidden: v.Validator<number>;
}>>;
export declare type SupervisedDictionaryLearningMetaParameters = v.ValidType<typeof SupervisedDictionaryLearningMetaParameterSchema>;
export declare class SupervisedDictionaryLearning extends Algorithm {
    protected datasetDescription: SupervisedDictionaryLearningDatasetDescription;
    protected readonly name: string;
    protected readonly opts: SupervisedDictionaryLearningMetaParameters;
    constructor(datasetDescription: SupervisedDictionaryLearningDatasetDescription, opts?: Partial<SupervisedDictionaryLearningMetaParameters>, saveLocation?: string);
    _build(): Promise<void>;
    loss: (X: tf.Tensor<tf.Rank.R2>, Y: tf.Tensor<tf.Rank.R2>) => any;
    protected _train(X: tf.Tensor2D, Y: tf.Tensor2D, o: OptimizationParameters): Promise<import("analysis/History").History>;
    protected _predict(X: tf.Tensor2D, o?: Partial<OptimizationParameters>): Promise<tf.Variable<tf.Rank.R2>>;
    getDefaultOptimizerParameters(o?: Partial<OptimizationParameters>): OptimizationParameters;
    static fromSavedState(location: string): Promise<SupervisedDictionaryLearning>;
    readonly W: tf.Variable<tf.Rank.R2>;
    readonly H: tf.Variable<tf.Rank.R2>;
    readonly D: tf.Variable<tf.Rank.R2>;
}
