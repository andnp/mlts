import * as tf from '@tensorflow/tfjs';
import * as path from 'path';
import * as _ from 'lodash';
import * as v from 'validtyped';

import { Algorithm } from "algorithms/Algorithm";
import { OptimizationParameters, Optimizer } from 'optimization/Optimizer';
import { readJson } from 'utils/files';
import { SupervisedDatasetDescription, SupervisedDatasetDescriptionSchema } from 'data/DatasetDescription';
import { printProgressAsync } from 'utils/printer';
import { LoggerCallback } from 'utils/tensorflow';
import { History } from 'analysis/History';
import { constructTFNetwork, LayerMetaParametersSchema } from 'algorithms/utils/layers';
import * as arrays from 'utils/arrays';

export const TwoStageAutoencoderMetaParameterSchema = v.object({
    layers: v.array(LayerMetaParametersSchema),
});

export type TwoStageAutoencoderMetaParameters = v.ValidType<typeof TwoStageAutoencoderMetaParameterSchema>;

export class TwoStageAutoencoder extends Algorithm {
    protected readonly name = TwoStageAutoencoder.name;
    protected readonly opts: TwoStageAutoencoderMetaParameters;
    protected model: tf.Model;

    protected innerLayer: tf.SymbolicTensor;
    protected inputs: tf.SymbolicTensor;
    protected predictionModel: tf.Model;

    // ----------------
    // Model Definition
    // ----------------
    constructor (
        protected datasetDescription: SupervisedDatasetDescription,
        opts?: Partial<TwoStageAutoencoderMetaParameters>,
    ) {
        super();
        this.opts = _.merge({
            layers: [{ units: 25, regularizer: { type: 'l1', weight: 0 }, activation: 'sigmoid', type: 'dense' }]
        }, opts);

        arrays.middleItem(this.opts.layers).name = 'innerLayer';

        this.inputs = tf.layers.input({ shape: [datasetDescription.features] });

        const network = constructTFNetwork(this.opts.layers, this.inputs);

        this.innerLayer = arrays.middleItem(network);

        const outputs_x = tf.layers.dense({ units: datasetDescription.features, activation: 'linear', name: 'out_x' }).apply(_.last(network)!) as tf.SymbolicTensor;

        this.model = tf.model({
            inputs: [this.inputs],
            outputs: [outputs_x],
        });

        const predictionLayer = tf.layers.dense({ units: this.datasetDescription.classes, activation: 'sigmoid' });
        const predictionOutputs = predictionLayer.apply(this.innerLayer) as tf.SymbolicTensor;

        this.predictionModel = tf.model({
            inputs: [this.inputs],
            outputs: [predictionOutputs]
        });


        this.model.summary(72);
    }

    // --------
    // Training
    // --------
    async train(X: tf.Tensor2D, Y: tf.Tensor2D, opts?: Partial<OptimizationParameters>) {
        const o = this.getDefaultOptimizationParameters(opts);
        this.model.compile({
            optimizer: new Optimizer(o).getTfOptimizer(),
            loss: 'meanSquaredError',
        });

        const history = await printProgressAsync(async (printer) => {
            return this.model.fit(X, X, {
                batchSize: o.batchSize || X.shape[0],
                epochs: o.iterations,
                shuffle: true,
                yieldEvery: 'epoch',
                callbacks: [new LoggerCallback(printer)],
            });
        });

        this.predictionModel.compile({
            optimizer: new Optimizer(o).getTfOptimizer(),
            loss: 'categoricalCrossentropy',
        });

        await printProgressAsync(async (printer) => {
            return this.predictionModel.fit(X, Y, {
                batchSize: o.batchSize || X.shape[0],
                epochs: o.iterations,
                shuffle: true,
                yieldEvery: 'epoch',
                callbacks: [new LoggerCallback(printer)],
            });
        });

        return History.fromTensorflowHistory(this.name, this.opts, history);
    }

    loss(X: tf.Tensor2D, Y: tf.Tensor2D) {
        const X_hat = this.model.predict(X) as tf.Tensor2D;
        return tf.losses.meanSquaredError(X, X_hat);
    }

    reconstructionLoss(X: tf.Tensor2D) {
        const x_loss = this.model.evaluate(X, X) as tf.Scalar;
        return x_loss.get();
    }

    async predict(X: tf.Tensor2D) {
        const Y_hat_batches = X.split(10).map(d => (this.predictionModel.predictOnBatch(d) as tf.Tensor2D));

        const Y_hat = tf.concat(Y_hat_batches, 0);
        return Y_hat;
    }

    // ------
    // Saving
    // ------
    static async fromSavedState(location: string) {
        const subfolder = await this.findSavedState(location);
        const state = await readJson(path.join(subfolder, 'state.json'), SaveDataSchema);
        const layer = new TwoStageAutoencoder(state.datasetDescription, state.metaParameters);

        layer.model = await tf.loadModel('file://' + path.join(subfolder, 'model/model.json'));

        return layer;
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
    metaParameters: TwoStageAutoencoderMetaParameterSchema,
});
