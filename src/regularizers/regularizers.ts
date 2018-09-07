import * as tf from '@tensorflow/tfjs';
import * as v from 'validtyped';

// ---------------------
// L1 Regularizer
// ---------------------

export const l1ParametersSchema = v.object({
    type: v.string(['l1']),
    weight: v.number(),
});

export const l1 = (x: tf.Tensor2D) => x.norm(1);

// ---------------------
// L2 Regularizer
// ---------------------

export const l2ParametersSchema = v.object({
    type: v.string(['l2']),
    weight: v.number(),
});

export const l2 = (x: tf.Tensor2D) => x.norm(2);

// ---------------------
// Generic Regularizer
// ---------------------

export const RegularizerParametersSchema = l1ParametersSchema.or(l2ParametersSchema);
export type RegularizerParameters = v.ValidType<typeof RegularizerParametersSchema>;

export const regularize = (params: RegularizerParameters, x: tf.Tensor2D): tf.Tensor<tf.Rank.R0> => {
    switch(params.type) {
        case 'l1': return tf.mul(l1(x), params.weight);
        case 'l2': return tf.mul(l2(x), params.weight);
        default: throw new Error(`I don't know this regularizer yet..`);
    }
}
