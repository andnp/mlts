import * as tf from '@tensorflow/tfjs';

export function meanSquaredError(Y_hat: tf.Tensor2D, Y: tf.Tensor2D) {
    return tf.mean(Y_hat.squaredDifference(Y)) as tf.Scalar;
}
