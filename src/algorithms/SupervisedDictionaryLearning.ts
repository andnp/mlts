import * as tf from '@tensorflow/tfjs';
import * as path from 'path';
import * as _ from 'lodash';
import * as v from 'validtyped';

import { Algorithm } from "algorithms/Algorithm";
import { Optimizer, OptimizationParameters } from 'optimization/Optimizer';
import { autoDispose, randomInitVariable } from 'utils/tensorflow';
import { readJson } from 'utils/files';
import { regularize, RegularizerParametersSchema } from 'regularizers/regularizers';
import { SupervisedDictionaryLearningDatasetDescription, SupervisedDictionaryLearningDatasetDescriptionSchema } from 'data/DatasetDescription';

export const SupervisedDictionaryLearningMetaParameterSchema = v.object({
    regularizer: RegularizerParametersSchema,
    hidden: v.number(),
});

export type SupervisedDictionaryLearningMetaParameters = v.ValidType<typeof SupervisedDictionaryLearningMetaParameterSchema>;

export class SupervisedDictionaryLearning extends Algorithm {
    protected readonly name = SupervisedDictionaryLearning.name;
    protected readonly opts: SupervisedDictionaryLearningMetaParameters;

    constructor (
        protected datasetDescription: SupervisedDictionaryLearningDatasetDescription,
        opts?: Partial<SupervisedDictionaryLearningMetaParameters>,
    ) {
        super();
        this.opts = _.merge({
            regularizer: { type: 'l1', weight: 0 },
            hidden: 2,
        }, opts);

        this.params.W = randomInitVariable([this.datasetDescription.classes, this.opts.hidden]);
        this.params.H = randomInitVariable([this.opts.hidden, this.datasetDescription.samples]);
        this.params.D = randomInitVariable([this.datasetDescription.features, this.opts.hidden]);
    }

    loss = autoDispose((X: tf.Tensor2D, Y: tf.Tensor2D) => {
        const Y_hat = tf.sigmoid(tf.matMul(this.W, this.H));
        const X_hat = tf.matMul(this.D, this.H);
        const y_loss: tf.Tensor<tf.Rank.R0> = tf.losses.sigmoidCrossEntropy(Y.transpose(), Y_hat);
        const x_loss: tf.Tensor<tf.Rank.R0> = tf.losses.meanSquaredError(X.transpose(), X_hat);
        const reg = regularize(this.opts.regularizer, this.W);
        return y_loss.add(x_loss).add(reg);
    });

    async train(X: tf.Tensor2D, Y: tf.Tensor2D, o: OptimizationParameters) {
        const optimizer = new Optimizer(this.getDefaultOptimizerParameters(o));

        return optimizer.minimize(_.partial(this.loss, X, Y), [ this.W, this.D, this.H ]);
    }

    async predict(X: tf.Tensor2D, o?: Partial<OptimizationParameters>) {
        const optimizer = new Optimizer(this.getDefaultOptimizerParameters(o));

        const H_test = (X.shape[0] === this.datasetDescription.samples)
            ? this.H
            : randomInitVariable([this.opts.hidden, X.shape[0]]);

        await optimizer.minimize(() => {
            const X_hat = tf.matMul(this.D, H_test);
            return tf.losses.meanSquaredError(X.transpose(), X_hat);
        }, [ H_test ]);

        return tf.tidy(() => {
            return tf.sigmoid(tf.matMul(this.W, H_test)).transpose();
        });
    }

    getDefaultOptimizerParameters(o?: Partial<OptimizationParameters>): OptimizationParameters {
        return _.merge({
            iterations: 1000,
            type: 'adadelta',
            learningRate: 1.0,
        }, o);
    }

    static async fromSavedState(location: string) {
        const subfolder = await this.findSavedState(location);

        const state = await readJson(path.join(subfolder, 'state.json'), SaveDataSchema);

        const layer = new SupervisedDictionaryLearning(state.datasetDescription, state.metaParameters);

        await layer.loadTensorsFromDisk(subfolder);

        return layer;
    }

    get W() { return this.params.W; }
    get H() { return this.params.H; }
    get D() { return this.params.D; }
}

const SaveDataSchema = v.object({
    datasetDescription: SupervisedDictionaryLearningDatasetDescriptionSchema,
    metaParameters: SupervisedDictionaryLearningMetaParameterSchema,
});
