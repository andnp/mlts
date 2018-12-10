import * as tf from '@tensorflow/tfjs';
import * as _ from 'lodash';
import * as v from 'validtyped';

import { UnsupervisedAlgorithm } from "../algorithms/Algorithm";
import { Optimizer } from '../optimization/Optimizer';
import { RegularizerParametersSchema, regularize } from '../regularizers/regularizers';
import { MatrixFactorizationDatasetDescription } from '../data/DatasetDescription';
import { OptimizationParameters } from '../optimization/OptimizerSchemas';
import { randomInitVariable } from '../utils/tensorflow';

export class MatrixFactorization extends UnsupervisedAlgorithm {
    protected readonly name = MatrixFactorization.name;
    protected opts: MatrixFactorizationMetaParameters;

    d = randomInitVariable([this.opts.hidden, this.datasetDescription.features]);
    h = randomInitVariable([this.datasetDescription.samples, this.opts.hidden]);

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
    }

    loss(X: tf.Tensor2D, H: tf.Tensor2D, D: tf.Tensor2D) {
        const X_hat = H.matMul(D);
        const regD = this.opts.regularizerD ? regularize(this.opts.regularizerD, D) : tf.scalar(0);
        const regH = this.opts.regularizerH ? regularize(this.opts.regularizerH, H) : tf.scalar(0);
        return tf.losses.meanSquaredError(X, X_hat).add(regD).add(regH) as tf.Scalar;
    }

    protected async _train(X: tf.Tensor2D, o: OptimizationParameters) {
        const optimizer = new Optimizer(o);
        return optimizer.minimize(() => this.loss(X, this.h, this.d), [this.d, this.h]);
    }

    protected async _predict(X: tf.Tensor2D, o: OptimizationParameters): Promise<tf.Tensor2D> {
        const optimizer = new Optimizer(o);

        const Htest = randomInitVariable([X.shape[0], this.opts.hidden]);

        await optimizer.minimize(() => this.loss(X, Htest, this.d), [Htest]);

        return tf.tidy(() => Htest.matMul(this.d));
    }

    get D() {
        return this.d;
    }
    get H() {
        return this.h;
    }
    setD(tensor: tf.Tensor2D) {
        this.d = tf.variable(tensor);
    }
}

export const MatrixFactorizationMetaParametersSchema = v.object({
    regularizerD: RegularizerParametersSchema,
    regularizerH: RegularizerParametersSchema,
    hidden: v.number(),
}, { optional: ['regularizerD', 'regularizerH'] });
export type MatrixFactorizationMetaParameters = v.ValidType<typeof MatrixFactorizationMetaParametersSchema>;
