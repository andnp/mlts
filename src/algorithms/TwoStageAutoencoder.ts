import * as tf from '@tensorflow/tfjs';
import * as _ from 'lodash';
import * as v from 'validtyped';

import { arrays } from 'utilities-ts';
import { SupervisedAlgorithm } from "../algorithms/Algorithm";
import { Optimizer } from '../optimization/Optimizer';
import { SupervisedDatasetDescription } from '../data/DatasetDescription';
import { constructTFNetwork, LayerMetaParametersSchema } from '../algorithms/utils/layers';
import { RepresentationAlgorithm } from '../algorithms/interfaces/RepresentationAlgorithm';
import { OptimizationParameters } from '../optimization/OptimizerSchemas';

export const TwoStageAutoencoderMetaParameterSchema = v.object({
    layers: v.array(LayerMetaParametersSchema),
    retrainRepresentation: v.boolean(),
});

export type TwoStageAutoencoderMetaParameters = v.ValidType<typeof TwoStageAutoencoderMetaParameterSchema>;

export class TwoStageAutoencoder extends SupervisedAlgorithm implements RepresentationAlgorithm {
    protected readonly name = TwoStageAutoencoder.name;
    protected readonly opts: TwoStageAutoencoderMetaParameters;

    readonly model: tf.Model;
    readonly predictionModel: tf.Model;

    protected representationLayer: tf.SymbolicTensor;
    protected inputs: tf.SymbolicTensor;

    // ----------------
    // Model Definition
    // ----------------
    constructor (
        protected datasetDescription: SupervisedDatasetDescription,
        opts?: Partial<TwoStageAutoencoderMetaParameters>,
    ) {
        super(datasetDescription);
        this.opts = _.merge({
            layers: [{ units: 25, regularizer: { type: 'l1', weight: 0 }, activation: 'sigmoid', type: 'dense' }],
            retrainRepresentation: false,
        }, opts);

        // ---------------------
        // Create learning model
        // ---------------------
        arrays.middleItem(this.opts.layers).name = 'representationLayer';

        const inputs = tf.layers.input({ shape: [this.datasetDescription.features] });
        const network = constructTFNetwork(this.opts.layers, inputs);
        const outputs_x = tf.layers.dense({ units: this.datasetDescription.features, activation: 'linear', name: 'out_x' }).apply(_.last(network)!) as tf.SymbolicTensor;

        this.model = tf.model({
            inputs: [inputs],
            outputs: [outputs_x],
        });

        this.representationLayer = this.model.getLayer('representationLayer').output as tf.SymbolicTensor;
        this.inputs = this.model.input as tf.SymbolicTensor;

        // -----------------------
        // Create prediction model
        // -----------------------
        const predictionLayer = tf.layers.dense({ units: this.datasetDescription.classes, activation: 'sigmoid' });
        const predictionOutputs = predictionLayer.apply(this.representationLayer!) as tf.SymbolicTensor;
        this.predictionModel = tf.model({
            inputs: [this.inputs!],
            outputs: [predictionOutputs]
        });

        console.log('Representation Model::'); // tslint:disable-line no-console
        this.model.summary(72);
        console.log('Prediction Model::'); // tslint:disable-line no-console
        this.predictionModel.summary(72);
    }

    // --------
    // Training
    // --------
    protected async _train(X: tf.Tensor2D, Y: tf.Tensor2D, opts?: Partial<OptimizationParameters>) {
        const o = this.getDefaultOptimizationParameters(opts);

        // -------
        // Stage 1
        // -------
        let optimizer = new Optimizer(o);

        this.model.compile({
            optimizer: optimizer.getTfOptimizer(),
            loss: 'meanSquaredError',
        });

        await optimizer.fit(this.model, X, X, {
            batchSize: o.batchSize,
            epochs: o.iterations,
            shuffle: true,
        });

        // -------
        // Stage 2
        // -------
        optimizer = new Optimizer(o);

        // transfer weights from learning model to prediction model
        this.predictionModel.layers.forEach((layer, i) => {
            if (i === this.predictionModel.layers.length - 1) return;
            layer.setWeights(this.model.getLayer(undefined, i).getWeights());
            layer.trainable = this.opts.retrainRepresentation;
        });

        this.predictionModel.compile({
            optimizer: optimizer.getTfOptimizer(),
            loss: 'binaryCrossentropy',
        });

        return optimizer.fit(this.predictionModel, X, Y, {
            batchSize: o.batchSize,
            epochs: o.iterations,
            shuffle: true,
        });
    }

    loss(X: tf.Tensor2D, Y: tf.Tensor2D) {
        const X_hat = this.model.predict(X) as tf.Tensor2D;
        return tf.losses.meanSquaredError(X, X_hat);
    }

    async getRepresentation(X: tf.Tensor2D) {
        const representationModel = tf.model({
            inputs: [this.inputs!],
            outputs: [this.representationLayer!],
        });

        // transfer weights from learned model to representation model
        representationModel.layers.forEach((layer, i) => layer.setWeights(this.model.getLayer(undefined, i).getWeights()));

        return representationModel.predictOnBatch(X) as tf.Tensor2D;
    }

    reconstructionLoss(X: tf.Tensor2D) {
        const x_loss = this.model.evaluate(X, X) as tf.Scalar;
        return x_loss.get();
    }

    protected async _predict(X: tf.Tensor2D) {
        return this.predictionModel.predictOnBatch(X) as tf.Tensor2D;
    }

    private getDefaultOptimizationParameters(o?: Partial<OptimizationParameters>): OptimizationParameters {
        return _.merge({
            iterations: 100,
            type: 'adadelta',
            learningRate: 0.5,
        }, o);
    }
}
