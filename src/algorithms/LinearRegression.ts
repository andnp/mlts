import * as tf from '@tensorflow/tfjs';
import * as path from 'path';
import * as _ from 'lodash';
import * as v from 'validtyped';

import { Algorithm } from "algorithms/Algorithm";
import { OptimizationParameters } from 'optimization/Optimizer';
import { readJson } from 'utils/files';
import { RegularizerParametersSchema } from 'regularizers/regularizers';
import { SupervisedDatasetDescription, SupervisedDatasetDescriptionSchema } from 'data/DatasetDescription';
import { History } from 'analysis/History';
import { LoggerCallback } from 'utils/tensorflow';
import { printProgressAsync } from 'utils/printer';

export const LinearRegressionMetaParameterSchema = v.object({
    regularizer: RegularizerParametersSchema,
});

export type LinearRegressionMetaParameters = v.ValidType<typeof LinearRegressionMetaParameterSchema>;

export class LinearRegression extends Algorithm {
    protected readonly name = LinearRegression.name;
    protected readonly opts: LinearRegressionMetaParameters;
    protected model: tf.Model;

    constructor (
        protected datasetDescription: SupervisedDatasetDescription,
        opts?: Partial<LinearRegressionMetaParameters>,
    ) {
        super();
        this.opts = _.merge({
            regularizer: { type: 'l1', weight: 0 },
        }, opts);

        const regularizer =
            this.opts.regularizer.type === 'l1' ? tf.regularizers.l1({ l1: this.opts.regularizer.weight }) :
            this.opts.regularizer.type === 'l2' ? tf.regularizers.l2({ l2: this.opts.regularizer.weight }) : undefined;

        const model = tf.sequential();
        model.add(tf.layers.inputLayer({ inputShape: [datasetDescription.features] }));
        model.add(tf.layers.dense({ units: datasetDescription.classes, activation: 'linear', kernelRegularizer: regularizer, name: 'W' }));

        this.model = model;
    }

    async train(X: tf.Tensor2D, Y: tf.Tensor2D, opts?: Partial<OptimizationParameters>) {
        const o = this.getDefaultOptimizationParameters(opts);
        this.model.compile({
            optimizer: tf.train.adadelta(o.learningRate),
            loss: 'meanSquaredError',
        });

        const history = await printProgressAsync(async (printer) => {
            return this.model.fit(X, Y, {
                batchSize: 1000,
                epochs: o.iterations,
                shuffle: true,
                yieldEvery: 'epoch',
                callbacks: [new LoggerCallback(printer)],
            });
        });

        return History.fromTensorflowHistory(this.name, this.opts, history);
    }

    loss(X: tf.Tensor2D, Y: tf.Tensor2D) {
        const Y_hat = this.model.predict(X) as tf.Tensor2D;
        return tf.losses.meanSquaredError(Y, Y_hat);
    }

    async predict(X: tf.Tensor2D) {
        return this.model.predict(X) as tf.Tensor2D;
    }

    static async fromSavedState(location: string) {
        const subfolder = await this.findSavedState(location);
        const state = await readJson(path.join(subfolder, 'state.json'), SaveDataSchema);
        const layer = new LinearRegression(state.datasetDescription, state.metaParameters);

        layer.model = await tf.loadModel('file://' + path.join(subfolder, 'model'));

        return layer;
    }

    get W() { return this.model.getLayer('W').getWeights()[0] as tf.Tensor2D; }

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
    metaParameters: LinearRegressionMetaParameterSchema,
});
