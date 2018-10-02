import * as tf from '@tensorflow/tfjs';
import * as v from 'validtyped';
export declare const l1ParametersSchema: v.Validator<v.ObjectValidator<{
    type: v.Validator<"l1">;
    weight: v.Validator<number>;
}>>;
export declare const l1: (x: tf.Tensor<tf.Rank.R2>) => tf.Tensor<tf.Rank>;
export declare const l2ParametersSchema: v.Validator<v.ObjectValidator<{
    type: v.Validator<"l2">;
    weight: v.Validator<number>;
}>>;
export declare const l2: (x: tf.Tensor<tf.Rank.R2>) => tf.Tensor<tf.Rank>;
export declare const RegularizerParametersSchema: v.Validator<v.ObjectValidator<{
    type: v.Validator<"l1">;
    weight: v.Validator<number>;
}> | v.ObjectValidator<{
    type: v.Validator<"l2">;
    weight: v.Validator<number>;
}>>;
export declare type RegularizerParameters = v.ValidType<typeof RegularizerParametersSchema>;
export declare const regularize: (params: v.ObjectValidator<{
    type: v.Validator<"l1">;
    weight: v.Validator<number>;
}> | v.ObjectValidator<{
    type: v.Validator<"l2">;
    weight: v.Validator<number>;
}>, x: tf.Tensor<tf.Rank.R2>) => tf.Tensor<tf.Rank.R0>;
export declare const regularizeLayer: (params: v.ObjectValidator<{
    type: v.Validator<"l1">;
    weight: v.Validator<number>;
}> | v.ObjectValidator<{
    type: v.Validator<"l2">;
    weight: v.Validator<number>;
}>) => import("@tensorflow/tfjs-layers/dist/regularizers").Regularizer;
