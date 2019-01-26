import * as tf from '@tensorflow/tfjs';
import * as _ from 'lodash';

import { DatasetDescription, SupervisedDatasetDescription } from '../data/DatasetDescription';
import { History } from '../analysis/History';
import { flatten } from '../utils/flatten';
import { OptimizationParameters } from '../optimization/OptimizerSchemas';

export abstract class Algorithm {
    protected opts: object = {};
    abstract name: string;
    constructor (
        protected datasetDescription: DatasetDescription,
    ) {}

    protected abstract async _predict(T: tf.Tensor2D, opts?: Partial<OptimizationParameters>): Promise<tf.Tensor2D>;
    async predict(T: tf.Tensor2D, opts?: Partial<OptimizationParameters>): Promise<tf.Tensor2D> {
        return this._predict(T, opts);
    }

    // ----------
    // Parameters
    // ----------
    getParameters() {
        return flatten(this.opts);
    }
}

export abstract class SupervisedAlgorithm extends Algorithm {
    constructor (
        protected datasetDescription: SupervisedDatasetDescription,
    ) { super(datasetDescription); }

    // --------
    // Training
    // --------
    protected abstract async _train(X: tf.Tensor2D, Y: tf.Tensor2D, opts?: Partial<OptimizationParameters>): Promise<History | tf.History>;

    async train(X: tf.Tensor2D, Y: tf.Tensor2D, opts?: Partial<OptimizationParameters>): Promise<History> {
        const history = await this._train(X, Y, opts);

        if (history instanceof History) return history;
        return History.fromTensorflowHistory(this.name, this.opts, history);
    }
}

export abstract class UnsupervisedAlgorithm extends Algorithm {
    // --------
    // Training
    // --------
    protected abstract async _train(X: tf.Tensor2D, opts?: Partial<OptimizationParameters>): Promise<History | tf.History>;

    async train(X: tf.Tensor2D, opts?: Partial<OptimizationParameters>): Promise<History> {
        const history = await this._train(X, opts);

        if (history instanceof History) return history;
        return History.fromTensorflowHistory(this.name, this.opts, history);
    }
}
