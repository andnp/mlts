import * as tf from '@tensorflow/tfjs';
import * as v from 'validtyped';
import { DeepPartial } from 'simplytyped';
import { SupervisedAlgorithm } from './Algorithm';
import { OptimizationParameters } from '../optimization/OptimizerSchemas';
import { MatrixFactorization } from './MatrixFactorization';
import { LogisticRegression } from './LogisticRegression';
import { SupervisedDictionaryLearningDatasetDescription } from '../data/DatasetDescription';
import { RepresentationAlgorithm } from '../algorithms/interfaces/RepresentationAlgorithm';
export declare class TwoStageDictionaryLearning extends SupervisedAlgorithm implements RepresentationAlgorithm {
    protected datasetDescription: SupervisedDictionaryLearningDatasetDescription;
    readonly name: string;
    readonly stage1: MatrixFactorization;
    readonly stage2: LogisticRegression;
    protected opts: TwoStageDictionaryLearningMetaParameters;
    constructor(datasetDescription: SupervisedDictionaryLearningDatasetDescription, opts?: DeepPartial<TwoStageDictionaryLearningMetaParameters>);
    private getDefaults;
    loss(X: tf.Tensor2D, Y: tf.Tensor2D): tf.Tensor<tf.Rank>;
    protected _train(X: tf.Tensor2D, Y: tf.Tensor2D, opts?: Partial<OptimizationParameters>): Promise<import("..").History>;
    protected _predict(T: tf.Tensor2D, opts?: Partial<OptimizationParameters> & {
        useOriginalH?: boolean;
    }): Promise<tf.Tensor<tf.Rank.R2>>;
    getRepresentation(X: tf.Tensor2D, opts?: Partial<OptimizationParameters>): Promise<tf.Tensor<tf.Rank.R2>>;
}
export declare const TwoStageDictionaryLearningMetaParametersSchema: v.Validator<v.ObjectValidator<{
    stage1: v.Validator<Partial<import("simplytyped").ObjectType<{
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
    }>, "hidden">>>>;
    stage2: v.Validator<Partial<import("simplytyped").ObjectType<{
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
    }>, never>>>>;
    hidden: v.Validator<number>;
}>>;
export declare type TwoStageDictionaryLearningMetaParameters = v.ValidType<typeof TwoStageDictionaryLearningMetaParametersSchema>;
