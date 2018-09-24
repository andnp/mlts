import * as tf from '@tensorflow/tfjs';
import * as path from 'path';
import * as _ from 'lodash';
import * as v from 'validtyped';

import { Algorithm } from "algorithms/Algorithm";
import { Optimizer } from 'optimization/Optimizer';
import { RegularizerParametersSchema, regularizeLayer } from 'regularizers/regularizers';
import { MatrixFactorizationDatasetDescription } from 'data/DatasetDescription';
import { LayerConfig } from '@tensorflow/tfjs-layers/dist/engine/topology';
import { History } from 'analysis/History';
import { OptimizationParameters } from 'optimization/OptimizerSchemas';

class DictLayer extends tf.layers.Layer {
    static className = DictLayer.name;
    name = DictLayer.name;
    private D: tf.LayerVariable;
    private H: tf.LayerVariable;

    constructor (
        private config: LayerConfig & MatrixFactorizationMetaParameters & { datasetDescription: MatrixFactorizationDatasetDescription },
    ) {
        super(config);

        this.D = this.addWeight('D', [this.config.hidden, this.config.datasetDescription.features], 'float32', tf.initializers.glorotNormal({}), regularizeLayer(this.config.regularizerD));
        this.H = this.addWeight('H', [this.config.datasetDescription.samples, this.config.hidden], 'float32', tf.initializers.glorotNormal({}), regularizeLayer(this.config.regularizerH));
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

const MODEL = 'model';
export class MatrixFactorization extends Algorithm {
    protected readonly name = MatrixFactorization.name;

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
        saveLocation = 'savedModels',
    ) {
        super(datasetDescription, saveLocation);
        this.opts = this.getDefaults(opts);
    }

    protected async _build() {
        this.registerModel(MODEL, () => {
            const model = tf.sequential();

            model.add(tf.layers.inputLayer({ inputShape: [this.datasetDescription.features] }));
            model.add(new DictLayer({ ...this.opts, datasetDescription: this.datasetDescription }));

            return model;
        });
    }

    loss(X: tf.Tensor2D) {
        const model = this.assertModel(MODEL);
        const X_hat = model.predict(X) as tf.Tensor;
        return tf.losses.meanSquaredError(X, X_hat);
    }

    protected async _train(X: tf.Tensor2D, Y: tf.Tensor2D, o: OptimizationParameters) {
        const model = this.assertModel(MODEL);
        const optimizer = this.registerOptimizer('opt', () => new Optimizer(o));

        model.compile({
            optimizer: optimizer.getTfOptimizer(),
            loss: 'meanSquaredError',
        });

        const history = await optimizer.fit(model, X, X, {
            batchSize: X.shape[0],
            epochs: o.iterations,
            shuffle: false,
        });

        // we've finished optimizing, so we can release our optimizer
        this.clearOptimizer('opt');

        return History.fromTensorflowHistory(this.name, this.opts, history);
    }

    protected async _predict(): Promise<tf.Tensor2D> { throw new Error('Predict not implemented for MatrixFactorization'); }

    static async fromSavedState(location: string) {
        return new MatrixFactorization({} as MatrixFactorizationDatasetDescription).loadFromDisk(location);
    }

    get D() {
        const model = this.assertModel(MODEL);
        return model.getLayer(DictLayer.name).getWeights()[0] as tf.Tensor2D;
    }
    get H() {
        const model = this.assertModel(MODEL);
        return model.getLayer(DictLayer.name).getWeights()[1] as tf.Tensor2D;
    }
    setD(tensor: tf.Tensor2D) {
        const model = this.assertModel(MODEL);
        model.getLayer(DictLayer.name).setWeights([tensor, this.H]);
    }
}

export const MatrixFactorizationMetaParametersSchema = v.object({
    regularizerD: RegularizerParametersSchema,
    regularizerH: RegularizerParametersSchema,
    hidden: v.number(),
});
export type MatrixFactorizationMetaParameters = v.ValidType<typeof MatrixFactorizationMetaParametersSchema>;
