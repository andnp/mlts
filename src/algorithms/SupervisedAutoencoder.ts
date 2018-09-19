import * as tf from '@tensorflow/tfjs';
import * as path from 'path';
import * as _ from 'lodash';
import * as v from 'validtyped';

import { Algorithm } from "algorithms/Algorithm";
import { OptimizationParameters } from 'optimization/Optimizer';
import { readJson } from 'utils/files';
import { SupervisedDatasetDescription, SupervisedDatasetDescriptionSchema } from 'data/DatasetDescription';
import { printProgressAsync } from 'utils/printer';
import { LoggerCallback } from 'utils/tensorflow';
import { History } from 'analysis/History';
import { LayerMetaParametersSchema, constructTFNetwork } from 'algorithms/utils/layers';
import * as arrays from 'utils/arrays';
import { RepresentationAlgorithm } from 'algorithms/interfaces/RepresentationAlgorithm';

export const SupervisedAutoencoderMetaParameterSchema = v.object({
    layers: v.array(LayerMetaParametersSchema),
});

export type SupervisedAutoencoderMetaParameters = v.ValidType<typeof SupervisedAutoencoderMetaParameterSchema>;

export class SupervisedAutoencoder extends Algorithm implements RepresentationAlgorithm {
    protected readonly name = SupervisedAutoencoder.name;
    protected readonly opts: SupervisedAutoencoderMetaParameters;
    protected model: tf.Model;

    protected representationLayer: tf.SymbolicTensor;
    protected inputs: tf.SymbolicTensor;

    // ----------------
    // Model Definition
    // ----------------
    constructor (
        protected datasetDescription: SupervisedDatasetDescription,
        opts?: Partial<SupervisedAutoencoderMetaParameters>,
    ) {
        super();
        this.opts = _.merge({
            layers: [{ units: 25, regularizer: { type: 'l1', weight: 0 }, activation: 'sigmoid', type: 'dense' }]
        }, opts);

        this.inputs = tf.layers.input({ shape: [datasetDescription.features ] });

        const network = constructTFNetwork(this.opts.layers, this.inputs);

        this.representationLayer = arrays.middleItem(network);

        const outputs_y = tf.layers.dense({ units: datasetDescription.classes, activation: 'sigmoid', name: 'out_y' }).apply(this.representationLayer) as tf.SymbolicTensor;
        const outputs_x = tf.layers.dense({ units: datasetDescription.features, activation: 'linear', name: 'out_x' }).apply(_.last(network)!) as tf.SymbolicTensor;

        this.model = tf.model({
            inputs: [this.inputs],
            outputs: [outputs_y, outputs_x],
        });

        this.model.summary(72);
    }

    // --------
    // Training
    // --------
    async train(X: tf.Tensor2D, Y: tf.Tensor2D, opts?: Partial<OptimizationParameters>) {
        const o = this.getDefaultOptimizationParameters(opts);
        this.model.compile({
            optimizer: tf.train.adadelta(o.learningRate),
            loss: ['categoricalCrossentropy', 'meanSquaredError'],
            metrics: { out_y: 'accuracy' },
        });

        const history = await printProgressAsync(async (printer) => {
            return this.model.fit(X, [Y, X], {
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
        const [Y_hat, X_hat] = this.model.predict(X) as tf.Tensor2D[];
        return tf.losses.sigmoidCrossEntropy(Y, Y_hat).add(tf.losses.meanSquaredError(X, X_hat));
    }

    async getRepresentation(X: tf.Tensor2D) {
        const model = tf.model({
            inputs: [this.inputs],
            outputs: [this.representationLayer],
        });

        model.layers.forEach((layer, i) => layer.setWeights(this.model.getLayer(undefined, i).getWeights()));

        const H = model.predictOnBatch(X) as tf.Tensor2D;
        return H;
    }

    reconstructionLoss(X: tf.Tensor2D) {
        const fake_y = tf.zeros([X.shape[0], this.datasetDescription.classes]);
        const [, x_loss] = this.model.evaluate(X, [fake_y, X]) as tf.Scalar[];
        return x_loss.get();
    }

    async predict(X: tf.Tensor2D) {
        const Y_hat_batches = X.split(10).map(d => (this.model.predictOnBatch(d) as tf.Tensor2D[])[0]);

        const Y_hat = tf.concat(Y_hat_batches, 0);
        return Y_hat;
    }

    // ------
    // Saving
    // ------
    static async fromSavedState(location: string) {
        const subfolder = await this.findSavedState(location);
        const state = await readJson(path.join(subfolder, 'state.json'), SaveDataSchema);
        const layer = new SupervisedAutoencoder(state.datasetDescription, state.metaParameters);

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
    metaParameters: SupervisedAutoencoderMetaParameterSchema,
});
