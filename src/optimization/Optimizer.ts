import * as tf from '@tensorflow/tfjs';
import * as _ from 'lodash';
import * as v from 'validtyped';
import * as path from 'path';
import { printProgressAsync } from 'utils/printer';
import { repeat } from 'utils/tasks';
import { assertNever } from 'utils/tsUtil';
import { writeJson, readJson } from 'utils/files';

// -----------------------
// Optimization Parameters
// -----------------------

const AdadeltaParametersSchema = v.object({
    type: v.string(['adadelta']),
    learningRate: v.number(),
});

const OptimizationParametersSchema = v.object({
    threshold: v.number(),
    iterations: v.number(),
}, { optional: ['threshold'] }).and(AdadeltaParametersSchema);

export type AdadeltaParameters = v.ValidType<typeof AdadeltaParametersSchema>;
export type OptimizationParameters = v.ValidType<typeof OptimizationParametersSchema>;

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

        this.optimizer = this.constructOptimizer();
    }

    async minimize(lossFunc: () => tf.Tensor<tf.Rank.R0>, vars: tf.Variable[]) {
        await printProgressAsync(printer => {
            return repeat(this.parameters.iterations - this.completedIterations, () => {
                const lossTensor = this.optimizer.minimize(
                    lossFunc,
                    true,
                    vars,
                );
                const loss = lossTensor!.get();
                if (this.opts.printProgress) printer(`${this.completedIterations}: ${loss}`);
                this.completedIterations++;
            });
        });
    }

    private constructOptimizer(): tf.Optimizer {
        if (this.parameters.type === 'adadelta') {
            return tf.train.adadelta(this.parameters.learningRate);
        }

        assertNever(this.parameters.type);
        throw new Error('Unexpected line reached');
    }

    // ------------------
    // Saving and Loading
    // ------------------

    async saveState(location: string) {
        const state: SaveData = {
            iterations: this.completedIterations,
            parameters: this.parameters,
        };

        await writeJson(path.join(location, 'state.json'), state);
    }

    static async fromSavedState(location: string): Promise<Optimizer> {
        const saveData = await readJson(path.join(location, 'state.json'), SaveDataSchema);
        const optimizer = new Optimizer(saveData.parameters);
        optimizer.completedIterations = saveData.iterations;
        return optimizer;
    }
}

const SaveDataSchema = v.object({
    iterations: v.number(),
    parameters: OptimizationParametersSchema,
});
type SaveData = v.ValidType<typeof SaveDataSchema>;
