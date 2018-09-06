import * as tf from '@tensorflow/tfjs';

import { MatrixFactorization, MatrixFactorizationTrainOptions } from "algorithms/MatrixFactorization";
import { OptimizationParameters } from 'optimization/Optimizer';

// TODO: this is lazy and not even correct...
// let's actually implement LinearRegression at some point
// because MatrixFactorization is a linear decomposition
// it is nearly the same as LinearRegression, but there are a few subtle differences
// and I'd rather avoid the the code-coupling here
export class LinearRegression extends MatrixFactorization {
    async train(X: tf.Tensor2D, o: OptimizationParameters & MatrixFactorizationTrainOptions) {
        return super.train(X, {
            ...o,
            trainDictionary: false,
        });
    }
}
