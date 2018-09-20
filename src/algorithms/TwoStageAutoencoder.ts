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
import { RepresentationAlgorithm } from 'algorithms/interfaces/RepresentationAlgorithm';

export const TwoStageAutoencoderMetaParameterSchema = v.object({
    layers: v.array(LayerMetaParametersSchema),
    retrainRepresentation: v.boolean(),
});

export type TwoStageAutoencoderMetaParameters = v.ValidType<typeof TwoStageAutoencoderMetaParameterSchema>;

export class TwoStageAutoencoder extends Algorithm implements RepresentationAlgorithm {
    protected readonly name = TwoStageAutoencoder.name;
    protected readonly opts: TwoStageAutoencoderMetaParameters;
    protected model: tf.Model;

    protected representationLayer: tf.SymbolicTensor;
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
            layers: [{ units: 25, regularizer: { type: 'l1', weight: 0 }, activation: 'sigmoid', type: 'dense' }],
            retrainRepresentation: false,
        }, opts);

        arrays.middleItem(this.opts.layers).name = 'innerLayer';

        this.inputs = tf.layers.input({ shape: [datasetDescription.features] });

        const network = constructTFNetwork(this.opts.layers, this.inputs);

        this.representationLayer = arrays.middleItem(network);

        const outputs_x = tf.layers.dense({ units: datasetDescription.features, activation: 'linear', name: 'out_x' }).apply(_.last(network)!) as tf.SymbolicTensor;

        this.model = tf.model({
            inputs: [this.inputs],
            outputs: [outputs_x],
        });

        const predictionLayer = tf.layers.dense({ units: this.datasetDescription.classes, activation: 'sigmoid' });
        const predictionOutputs = predictionLayer.apply(this.representationLayer) as tf.SymbolicTensor;

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
        this.optimizer = this.optimizer || new Optimizer(o);

        this.model.compile({
            optimizer: this.optimizer.getTfOptimizer(),
            loss: 'meanSquaredError',
        });

        const history = await this.optimizer.fit(this.model, X, X, {
            batchSize: o.batchSize,
            epochs: o.iterations,
            shuffle: true,
        });

        this.predictionModel.layers.forEach((layer, i) => {
            if (i === this.predictionModel.layers.length - 1) return;
            layer.setWeights(this.model.getLayer(undefined, i).getWeights());
            layer.trainable = this.opts.retrainRepresentation;
        });

        this.optimizer = new Optimizer(o);
        this.predictionModel.compile({
            optimizer: this.optimizer.getTfOptimizer(),
            loss: 'categoricalCrossentropy',
        });

        await this.optimizer.fit(this.predictionModel, X, Y, {
            batchSize: o.batchSize,
            epochs: o.iterations,
            shuffle: true,
        });

        return History.fromTensorflowHistory(this.name, this.opts, history);
    }

    loss(X: tf.Tensor2D, Y: tf.Tensor2D) {
        const X_hat = this.model.predict(X) as tf.Tensor2D;
        return tf.losses.meanSquaredError(X, X_hat);
    }

    async getRepresentation(X: tf.Tensor2D) {
        const representationModel = tf.model({
            inputs: [this.inputs],
            outputs: [this.representationLayer],
        });

        representationModel.layers.forEach((layer, i) => layer.setWeights(this.model.getLayer(undefined, i).getWeights()));

        return representationModel.predictOnBatch(X) as tf.Tensor2D;
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
