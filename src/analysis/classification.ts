import * as tf from '@tensorflow/tfjs';

export function getClassificationError(Y_hat: tf.Tensor2D, Y: tf.Tensor2D): tf.Tensor<tf.Rank.R0> {
    const y_hat = tf.argMax(Y_hat, 1);
    const y = tf.argMax(Y, 1);

    const correct = tf.equal(y_hat, y).sum();
    const total = tf.tensor(y_hat.shape[0]);

    return tf.tensor(1).sub(correct.toFloat().div(total));
}
