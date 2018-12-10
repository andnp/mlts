import * as tf from '@tensorflow/tfjs';
import * as _ from 'lodash';
import * as v from 'validtyped';
import { LayerConfig } from '@tensorflow/tfjs-layers/dist/engine/topology';

import { UnsupervisedAlgorithm } from "../algorithms/Algorithm";
import { Optimizer } from '../optimization/Optimizer';
import { RegularizerParametersSchema, regularizeLayer } from '../regularizers/regularizers';
import { MatrixFactorizationDatasetDescription } from '../data/DatasetDescription';
import { OptimizationParameters } from '../optimization/OptimizerSchemas';

class DictLayer extends tf.layers.Layer {
    static className = DictLayer.name;
    name = DictLayer.name;
    private D: tf.LayerVariable;
    private H: tf.LayerVariable;

    constructor (
        private config: LayerConfig & MatrixFactorizationMetaParameters & { datasetDescription: MatrixFactorizationDatasetDescription },
    ) {
        super(config);

        this.D = this.addWeight('D',
            [this.config.hidden, this.config.datasetDescription.features],
            'float32',
            tf.initializers.glorotNormal({}),
            this.config.regularizerD && regularizeLayer(this.config.regularizerD),
        );
        this.H = this.addWeight('H',
            [this.config.datasetDescription.samples, this.config.hidden],
            'float32',
            tf.initializers.glorotNormal({}),
            this.config.regularizerH && regularizeLayer(this.config.regularizerH),
        );
    }

    build() {
        this.built = true;
        this.trainableWeights = [this.D, this.H];
    }

    computeOutputShape(shape: number[]) {
        return [this.config.datasetDescription.samples, this.config.datasetDescription.features];
    }

    call(inputs: tf.Tensor) {
        return tf.tidy(() => tf.matMul(this.H.read() as tf.Tensor2D, this.D.read() as tf.Tensor2D));
    }

    getClassName() {
        return DictLayer.name;
    }

    getConfig() {
        return this.config as {};
    }

    trainable = true;
}
tf.serialization.registerClass(DictLayer);

export class MatrixFactorization extends UnsupervisedAlgorithm {
    protected readonly name = MatrixFactorization.name;
    readonly model: tf.Model;

    protected opts: MatrixFactorizationMetaParameters;

    private getDefaults(opts?: Partial<MatrixFactorizationMetaParameters>): MatrixFactorizationMetaParameters {
        return _.merge({
            regularizerD: {
                type: 'l1',
                weight: 0,
            },
            regularizerH: {
                type: 'l1',
                weight: 0,
            },
            hidden: 2,
        }, opts);
    }

    constructor (
        protected datasetDescription: MatrixFactorizationDatasetDescription,
        opts?: Partial<MatrixFactorizationMetaParameters>,
    ) {
        super(datasetDescription);
        this.opts = this.getDefaults(opts);

        this.model = this.constructModel(this.datasetDescription);
    }

    private constructModel(desc: MatrixFactorizationDatasetDescription) {
        const model = tf.sequential();

        model.add(tf.layers.inputLayer({ inputShape: [desc.features] }));
        model.add(new DictLayer({ ...this.opts, datasetDescription: desc }));

        return model;
    }

    loss(X: tf.Tensor2D) {
        const X_hat = this.model.predict(X) as tf.Tensor;
        return tf.losses.meanSquaredError(X, X_hat);
    }

    protected async _train(X: tf.Tensor2D, o: OptimizationParameters) {
        const optimizer = new Optimizer(o);

        this.model.compile({
            optimizer: optimizer.getTfOptimizer(),
            loss: 'meanSquaredError',
        });

        return optimizer.fit(this.model, X, X, {
            batchSize: X.shape[0],
            epochs: o.iterations,
            shuffle: false,
        });
    }

    protected async _predict(X: tf.Tensor2D, o: OptimizationParameters): Promise<tf.Tensor2D> {
        const optimizer = new Optimizer(o);

        const predictionModel = this.constructModel({
            ...this.datasetDescription,
            samples: X.shape[0],
        });

        const dictLayer = predictionModel.getLayer(DictLayer.name);

        predictionModel.compile({
            optimizer: optimizer.getTfOptimizer(),
            loss: 'meanSquaredError',
        });

        const randomH = dictLayer.getWeights()[1];
        dictLayer.setWeights([this.D, randomH]);

        await optimizer.fit(predictionModel, X, X, {
            batchSize: X.shape[0],
            epochs: o.iterations,
            shuffle: false,
        });

        return predictionModel.predictOnBatch(X) as tf.Tensor2D;
    }

    get D() {
        return this.model.getLayer(DictLayer.name).getWeights()[0] as tf.Tensor2D;
    }
    get H() {
        return this.model.getLayer(DictLayer.name).getWeights()[1] as tf.Tensor2D;
    }
    setD(tensor: tf.Tensor2D) {
        this.model.getLayer(DictLayer.name).setWeights([tensor, this.H]);
    }
}

export const MatrixFactorizationMetaParametersSchema = v.object({
    regularizerD: RegularizerParametersSchema,
    regularizerH: RegularizerParametersSchema,
    hidden: v.number(),
}, { optional: ['regularizerD', 'regularizerH'] });
export type MatrixFactorizationMetaParameters = v.ValidType<typeof MatrixFactorizationMetaParametersSchema>;
