import * as tf from '@tensorflow/tfjs';
import * as _ from 'lodash';
import { arrays } from 'utilities-ts';

import { printProgressAsync } from '../utils/printer';
import { repeat } from '../utils/tasks';
import { assertNever } from 'utilities-ts';
import { LoggerCallback } from '../utils/tensorflow';
import { OptimizationParameters } from './OptimizerSchemas';
import { ModelLoggingVerbosity } from '@tensorflow/tfjs-layers/dist/base_callbacks';
import { DeepPartial } from 'simplytyped';

export interface OptimizationOptions {
    printProgress: boolean;
}

// ---------
// Optimizer
// ---------

export function getDefaultParameters(opt?: DeepPartial<OptimizationParameters>): OptimizationParameters {
    const defaultParams: OptimizationParameters = {
        iterations: 100,
        type: 'rmsprop',
        learningRate: 0.001,
    };

    return _.merge(defaultParams, opt);
}

export function getDefaultOptions(opt?: Partial<OptimizationOptions>): OptimizationOptions {
    const defaultOpt: OptimizationOptions = {
        printProgress: true,
    };

    return _.merge(defaultOpt, opt);
}

export function getTfOptimizer(opt?: OptimizationParameters) {
    const o = getDefaultParameters(opt);
    if (o.type === 'adadelta') return tf.train.adadelta(o.learningRate, o.rho, o.epsilon);
    if (o.type === 'adagrad')  return tf.train.adagrad(o.learningRate);
    if (o.type === 'rmsprop')  return tf.train.rmsprop(o.learningRate);

    throw assertNever(o, 'Unexpected optimizer found');
}

export async function minimize(lossFunc: () => tf.Tensor<tf.Rank.R0>, params?: OptimizationParameters, vars?: tf.Variable[], opt?: Partial<OptimizationOptions>): Promise<number[]> {
    const p = getDefaultParameters(params);
    const o = getDefaultOptions(opt);
    const optimizer = getTfOptimizer(p);

    let completedIterations = 0;
    return printProgressAsync(printer => {
        return repeat(p.iterations, () => {
            const lossTensor = optimizer.minimize(
                lossFunc,
                true,
                vars,
            );
            const loss = lossTensor!.get();
            lossTensor!.dispose();
            if (o.printProgress) printer(`${completedIterations}: ${loss}`);
            completedIterations += 1;
            return loss;
        });
    });
}

export async function fit(model: tf.Model, X: tf.Tensor | tf.Tensor[], Y: tf.Tensor | tf.Tensor[], params: tf.ModelFitConfig) {
    const history = await printProgressAsync(async (printer) => {
        const callbacks = Array.isArray(params.callbacks) ? params.callbacks : [];

        return model.fit(X, Y, {
            batchSize: params.batchSize || arrays.getFirst(X).shape[0],
            yieldEvery: 'epoch',
            ...params,
            callbacks: [new LoggerCallback(printer), ...callbacks],
            verbose: ModelLoggingVerbosity.SILENT,
        });
    });

    return history;
}
