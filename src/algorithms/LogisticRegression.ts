import * as tf from '@tensorflow/tfjs';
import * as path from 'path';
import * as _ from 'lodash';
import * as v from 'validtyped';

import { Algorithm } from "algorithms/Algorithm";
import { OptimizationParameters, Optimizer } from 'optimization/Optimizer';
import { readJson } from 'utils/files';
import { RegularizerParametersSchema, regularizeLayer } from 'regularizers/regularizers';
import { SupervisedDatasetDescription, SupervisedDatasetDescriptionSchema } from 'data/DatasetDescription';
import { History } from 'analysis/History';

export const LogisticRegressionMetaParameterSchema = v.object({
    regularizer: RegularizerParametersSchema,
});

export type LogisticRegressionMetaParameters = v.ValidType<typeof LogisticRegressionMetaParameterSchema>;

export class LogisticRegression extends Algorithm {
    protected readonly name = LogisticRegression.name;
    protected readonly opts: LogisticRegressionMetaParameters;
    protected model: tf.Model;

    constructor (
        protected datasetDescription: SupervisedDatasetDescription,
        opts?: Partial<LogisticRegressionMetaParameters>,
    ) {
        super();
        this.opts = _.merge({
            regularizer: { type: 'l1', weight: 0 },
        }, opts);

        const model = this.model = tf.sequential();
        model.add(tf.layers.inputLayer({ inputShape: [datasetDescription.features] }));
        model.add(tf.layers.dense({ units: datasetDescription.classes, activation: 'sigmoid', kernelRegularizer: regularizeLayer(this.opts.regularizer), name: 'W' }));
    }

    async train(X: tf.Tensor2D, Y: tf.Tensor2D, opts?: Partial<OptimizationParameters>) {
        const o = this.getDefaultOptimizationParameters(opts);
        this.optimizer = this.optimizer || new Optimizer(o);

        this.model.compile({
            optimizer: this.optimizer.getTfOptimizer(),
            loss: 'categoricalCrossentropy',
        });

        const history = await this.optimizer.fit(this.model, X, Y, {
            batchSize: o.batchSize || X.shape[0],
            epochs: o.iterations,
            shuffle: true,
        });

        this.optimizer = undefined;

        return History.fromTensorflowHistory(this.name, this.opts, history);
    }

    loss(X: tf.Tensor2D, Y: tf.Tensor2D) {
        const Y_hat = this.model.predict(X) as tf.Tensor2D;
        return tf.losses.sigmoidCrossEntropy(Y, Y_hat);
    }

    async predict(X: tf.Tensor2D) {
        return this.model.predict(X) as tf.Tensor2D;
    }

    static async fromSavedState(location: string) {
        const subfolder = await this.findSavedState(location);
        const state = await readJson(path.join(subfolder, 'state.json'), SaveDataSchema);
        const layer = new LogisticRegression(state.datasetDescription, state.metaParameters);

        layer.model = await tf.loadModel('file://' + path.join(subfolder, 'model/model.json'));

        return layer;
    }

    get W() { return this.model.getLayer('W').getWeights()[0]; }
    setW(W: tf.Tensor2D) {
        this.model.getLayer('W').setWeights([W]);
        return this;
    }

    private getDefaultOptimizationParameters(o?: Partial<OptimizationParameters>): OptimizationParameters {
        return _.merge({
            iterations: 100,
            type: 'adadelta',
            learningRate: 0.5,
        }, o);
    }
}

const SaveDataSchema = v.object({
    datasetDescription: SupervisedDatasetDescriptionSchema,
    metaParameters: LogisticRegressionMetaParameterSchema,
});
