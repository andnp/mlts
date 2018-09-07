import * as tf from '@tensorflow/tfjs';
import * as path from 'path';
import * as _ from 'lodash';
import * as v from 'validtyped';

import { Algorithm } from "algorithms/Algorithm";
import { Optimizer, OptimizationParameters } from 'optimization/Optimizer';
import { autoDispose } from 'utils/tensorflow';
import { readJson } from 'utils/files';
import { regularize, RegularizerParametersSchema } from 'regularizers/regularizers';
import { SupervisedDatasetDescription, SupervisedDatasetDescriptionSchema } from 'data/DatasetDescription';

export const LogisticRegressionMetaParameterSchema = v.object({
    regularizer: RegularizerParametersSchema,
});

export type LogisticRegressionMetaParameters = v.ValidType<typeof LogisticRegressionMetaParameterSchema>;

export class LogisticRegression extends Algorithm {
    protected readonly name = LogisticRegression.name;
    protected readonly opts: LogisticRegressionMetaParameters;

    constructor (
        protected datasetDescription: SupervisedDatasetDescription,
        opts?: Partial<LogisticRegressionMetaParameters>,
    ) {
        super();
        this.opts = _.merge({
            regularizer: { type: 'l1', weight: 0 },
        }, opts);

        this.params.W = tf.variable(tf.randomNormal<tf.Rank.R2>([this.datasetDescription.classes, this.datasetDescription.features]));
    }

    loss = autoDispose((X: tf.Tensor2D, Y: tf.Tensor2D) => {
        const Y_hat = tf.sigmoid(tf.matMul(this.W, X));
        const loss: tf.Tensor<tf.Rank.R0> = tf.losses.sigmoidCrossEntropy(Y, Y_hat);
        const reg = regularize(this.opts.regularizer, this.W);
        return loss.add(reg);
    });

    async train(X: tf.Tensor2D, Y: tf.Tensor2D, o: OptimizationParameters) {
        const optimizer = new Optimizer(o);

        await optimizer.minimize(_.partial(this.loss, X, Y), [ this.W ]);
    }

    async predict(X: tf.Tensor2D) {
        return tf.tidy(() => {
            return tf.sigmoid(tf.matMul(this.W, X));
        });
    }

    static async fromSavedState(location: string) {
        const subfolder = await this.findSavedState(location);

        const state = await readJson(path.join(subfolder, 'state.json'), SaveDataSchema);

        const layer = new LogisticRegression(state.datasetDescription, state.metaParameters);

        await layer.loadTensorsFromDisk(subfolder);

        return layer;
    }

    get W() { return this.params.W; }
    setW(W: tf.Variable) {
        this.params.W.assign(W.as2D(this.datasetDescription.classes, this.datasetDescription.features));
        return this;
    }
}

const SaveDataSchema = v.object({
    datasetDescription: SupervisedDatasetDescriptionSchema,
    metaParameters: LogisticRegressionMetaParameterSchema,
});
