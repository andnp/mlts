import * as _ from 'lodash';
import * as tf from '@tensorflow/tfjs';
import * as v from 'validtyped';
import { DeepPartial } from 'simplytyped';

import { SupervisedAlgorithm } from './Algorithm';
import { OptimizationParameters } from '../optimization/OptimizerSchemas';
import { MatrixFactorization, MatrixFactorizationMetaParametersSchema } from './MatrixFactorization';
import { LogisticRegression, LogisticRegressionMetaParameterSchema } from './LogisticRegression';
import { SupervisedDictionaryLearningDatasetDescription } from '../data/DatasetDescription';
import { RepresentationAlgorithm } from '../algorithms/interfaces/RepresentationAlgorithm';
import { LinearRegression } from './LinearRegression';

export class TwoStageDictionaryLearning extends SupervisedAlgorithm implements RepresentationAlgorithm {
    protected readonly name = TwoStageDictionaryLearning.name;
    readonly stage1: MatrixFactorization;
    readonly stage2: LogisticRegression;

    protected opts: TwoStageDictionaryLearningMetaParameters;

    constructor(
        protected datasetDescription: SupervisedDictionaryLearningDatasetDescription,
        opts?: DeepPartial<TwoStageDictionaryLearningMetaParameters>,
    ) {
        super(datasetDescription);
        this.opts = _.merge({
            stage1: {},
            stage2: {},
            hidden: 2,
        }, opts);

        this.stage1 = new MatrixFactorization(datasetDescription, { ...this.opts.stage1, hidden: this.opts.hidden });
        // The logistic regression stage maps from HiddenRepresentation to classes.
        // So use number of hidden features here instead of number of dataset features.
        this.stage2 = new LogisticRegression({ features: this.opts.hidden, classes: this.datasetDescription.classes }, this.opts.stage2);
    }

    private getDefaults(opts?: Partial<OptimizationParameters>): OptimizationParameters {
        return _.merge({
            type: 'adadelta',
            learningRate: 2.0,
            iterations: 10,
        }, opts);
    }

    // --------
    // Training
    // --------

    loss(X: tf.Tensor2D, Y: tf.Tensor2D) {
        const s1_loss = this.stage1.loss(X, this.stage1.h, this.stage1.d, tf.onesLike(X));
        const s2_loss = this.stage2.loss(X.transpose(), Y.transpose());
        return s1_loss.add(s2_loss);
    }

    protected async _train(X: tf.Tensor2D, Y: tf.Tensor2D, opts?: Partial<OptimizationParameters>) {
        const o = this.getDefaults(opts);

        await this.stage1.train(X, o);
        const history = await this.stage2.train(this.stage1.H, Y, {...o, iterations: o.iterations});

        return history;
    }

    protected async _predict(T: tf.Tensor2D, opts?: Partial<OptimizationParameters> & { useOriginalH?: boolean }) {
        const o = this.getDefaults(opts);

        const H = opts && opts.useOriginalH
            ? this.stage1.H
            : await this.getRepresentation(T, o);

        const Y_hat = await this.stage2.predict(H);
        return Y_hat;
    }

    // ------------------------
    // Representation Algorithm
    // ------------------------
    async getRepresentation(X: tf.Tensor2D, opts?: Partial<OptimizationParameters>) {
        // a new representation can be calculated as a linear regression optimization over H.
        // X = argmin_H (X - DH) so the "inputs" to the linear regressor are "D" and the targets are "X"
        const stage3 = new LinearRegression({ features: this.opts.hidden, classes: X.shape[0] }, { regularizer: this.opts.stage1.regularizerH });
        await stage3.train(this.stage1.D.transpose(), X.transpose(), opts);
        const H = stage3.W.transpose();
        return H;
    }
}

export const TwoStageDictionaryLearningMetaParametersSchema = v.object({
    stage1: v.partial(MatrixFactorizationMetaParametersSchema),
    stage2: v.partial(LogisticRegressionMetaParameterSchema),
    hidden: v.number(),
});

export type TwoStageDictionaryLearningMetaParameters = v.ValidType<typeof TwoStageDictionaryLearningMetaParametersSchema>;
