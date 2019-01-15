import * as tf from '@tensorflow/tfjs';
import * as _ from 'lodash';
import { arrays } from 'utilities-ts';

import { Transformation } from '../transformations';
import { TensorflowDataset } from '../data';

export const MISSING_VALUE = -222.222;

export function whereMissing(X: tf.Tensor2D, t: tf.Tensor2D, f: tf.Tensor2D) {
    return tf.tidy(() => tf.where(X.equal(tf.scalar(MISSING_VALUE)), t, f));
}

export function applyMissingMask(X: tf.Tensor2D, m: tf.Tensor2D) {
    return tf.tidy(() => {
        const offset = tf.onesLike(m).sub(m).mul(tf.scalar(MISSING_VALUE));

        return X.mul(m).add(offset) as tf.Tensor2D;
    });
}

export function createMissingMask(X: tf.Tensor2D) {
    return tf.tidy(() => whereMissing(X, tf.zerosLike(X), tf.onesLike(X)));
}

export function missingToZeros(X: tf.Tensor2D) {
    return tf.tidy(() => whereMissing(X, tf.zerosLike(X), X));
}

export class MissingMaskLayer extends tf.layers.Layer {
    static className = MissingMaskLayer.name;
    call(inputs: tf.Tensor | tf.Tensor[]): tf.Tensor {
        return tf.tidy(() => {
            const input = arrays.getFirst(inputs) as tf.Tensor2D;
            return missingToZeros(input);
        });
    }

    getConfig(): tf.serialization.ConfigDict {
        return {};
    }
}
tf.serialization.registerClass(MissingMaskLayer);

export class RandomMissingTransformation extends Transformation {
    constructor(
        private rate: number,
    ) { super(); }

    async transformTensor(X: tf.Tensor2D) {
        const mask = tf.where(tf.randomUniform(X.shape, 0, 1).lessEqual(tf.scalar(this.rate)), tf.zerosLike(X), tf.onesLike(X)) as tf.Tensor2D;
        return applyMissingMask(X, mask);
    }
}

export class RandomMissingTargets extends Transformation {
    constructor(
        private rate: number,
    ) { super(); }

    async applyTransformation(data: TensorflowDataset) {
        const [ X, Y ] = data.train;
        const [ T, TY ] = data.test;

        return new TensorflowDataset(
            X,
            await this.transformTensor(Y),
            T,
            TY,
        );
    }

    async transformTensor(X: tf.Tensor2D) {
        const [ rows, cols ] = X.shape;
        const mask_row = tf.where(tf.randomUniform([rows], 0, 1).lessEqual(tf.scalar(this.rate)), tf.zeros([rows]), tf.ones([rows])).as2D(rows, 1);

        const mask = tf.concat2d(_.times(cols, () => mask_row), 1);
        return applyMissingMask(X, mask);
    }
}
