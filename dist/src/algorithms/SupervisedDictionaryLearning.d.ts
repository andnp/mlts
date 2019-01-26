import * as tf from '@tensorflow/tfjs';
import * as v from 'validtyped';
import { SupervisedAlgorithm } from "../algorithms/Algorithm";
import { SupervisedDictionaryLearningDatasetDescription } from '../data/DatasetDescription';
import { OptimizationParameters } from '../optimization/OptimizerSchemas';
import { History } from '../analysis';
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
export declare class SupervisedDictionaryLearning extends SupervisedAlgorithm {
    protected datasetDescription: SupervisedDictionaryLearningDatasetDescription;
    readonly name: string;
    protected readonly opts: SupervisedDictionaryLearningMetaParameters;
    readonly w: tf.Variable<tf.Rank.R2>;
    readonly h: tf.Variable<tf.Rank.R2>;
    readonly d: tf.Variable<tf.Rank.R2>;
    constructor(datasetDescription: SupervisedDictionaryLearningDatasetDescription, opts?: Partial<SupervisedDictionaryLearningMetaParameters>);
    loss: (X: tf.Tensor<tf.Rank.R2>, Y: tf.Tensor<tf.Rank.R2>) => any;
    protected _train(X: tf.Tensor2D, Y: tf.Tensor2D, opts?: OptimizationParameters): Promise<History>;
    protected _predict(X: tf.Tensor2D, opts?: Partial<OptimizationParameters>): Promise<tf.Variable<tf.Rank.R2>>;
    getDefaultOptimizerParameters(o?: Partial<OptimizationParameters>): OptimizationParameters;
    readonly W: tf.Variable<tf.Rank.R2>;
    readonly H: tf.Variable<tf.Rank.R2>;
    readonly D: tf.Variable<tf.Rank.R2>;
}
