import * as tf from '@tensorflow/tfjs';
import * as _ from 'lodash';
import * as v from 'validtyped';
import * as path from 'path';
import { arrays } from 'utilities-ts';

import { printProgressAsync } from '../utils/printer';
import { repeat } from '../utils/tasks';
import { files, assertNever } from 'utilities-ts';
import { History } from '../analysis/History';
import { LoggerCallback, EpochCounter } from '../utils/tensorflow';
import { OptimizationParameters, OptimizationParametersSchema } from './OptimizerSchemas';
import { ModelLoggingVerbosity } from '@tensorflow/tfjs-layers/dist/base_callbacks';

export interface OptimizationOptions {
    printProgress: boolean;
}

// ---------
// Optimizer
// ---------

export class Optimizer {
    protected opts: OptimizationOptions;
    protected optimizer: tf.Optimizer;

    // --------------
    // State Tracking
    // --------------
    protected completedIterations = 0;

    constructor (
        protected parameters: OptimizationParameters,
        options?: Partial<OptimizationOptions>,
    ) {
        this.opts = _.merge({
            printProgress: true,
        }, options);

        this.parameters = _.merge({
            iterations: 100,
            type: 'adadelta',
            learningRate: 0.1,
        }, this.parameters);

        this.optimizer = this.constructOptimizer();
    }

    async minimize(lossFunc: () => tf.Tensor<tf.Rank.R0>, vars: tf.Variable[]): Promise<History> {
        const losses = await printProgressAsync(printer => {
            return repeat(this.parameters.iterations - this.completedIterations, () => {
                const lossTensor = this.optimizer.minimize(
                    lossFunc,
                    true,
                    vars,
                );
                const loss = lossTensor!.get();
                lossTensor!.dispose();
                if (this.opts.printProgress) printer(`${this.completedIterations}: ${loss}`);
                this.completedIterations++;
                return loss;
            });
        });

        return new History('', {}, losses);
    }

    private constructOptimizer(): tf.Optimizer {
        if (this.parameters.type === 'adadelta') {
            return tf.train.adadelta(this.parameters.learningRate);
        }
        if (this.parameters.type === 'adagrad') {
            return tf.train.adagrad(this.parameters.learningRate);
        }
        if (this.parameters.type === 'rmsprop') {
            return tf.train.rmsprop(this.parameters.learningRate);
        }

        assertNever(this.parameters);
        throw new Error('Unexpected line reached');
    }
    async fit(model: tf.Model, X: tf.Tensor | tf.Tensor[], Y: tf.Tensor | tf.Tensor[], params: tf.ModelFitConfig) {
        const history = await printProgressAsync(async (printer) => {
            const epochs = params.epochs! - this.completedIterations;

            const callbacks = Array.isArray(params.callbacks) ? params.callbacks : [];

            return model.fit(X, Y, {
                batchSize: params.batchSize || arrays.getFirst(X).shape[0],
                yieldEvery: 'epoch',
                ...params,
                epochs,
                callbacks: [new LoggerCallback(printer, this.completedIterations), new EpochCounter(() => this.completedIterations++), ...callbacks],
                verbose: ModelLoggingVerbosity.SILENT,
            });
        });

        return history;
    }

    // ------------------
    // Saving and Loading
    // ------------------

    reset() {
        this.completedIterations = 0;
    }

    async saveState(location: string) {
        const state: SaveData = {
            iterations: this.completedIterations,
            parameters: this.parameters,
        };

        await files.writeJson(path.join(location, 'state.json'), state);
    }

    static async fromSavedState(location: string): Promise<Optimizer> {
        const saveData = await files.readJson(path.join(location, 'state.json'), SaveDataSchema);
        const optimizer = new Optimizer(saveData.parameters);
        optimizer.completedIterations = saveData.iterations;
        return optimizer;
    }

    getTfOptimizer() {
        return this.optimizer;
    }
}

const SaveDataSchema = v.object({
    iterations: v.number(),
    parameters: OptimizationParametersSchema,
});
type SaveData = v.ValidType<typeof SaveDataSchema>;
