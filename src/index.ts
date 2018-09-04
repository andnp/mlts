import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-node';

import * as tfUtil from 'utils/tensorflow';

import * as deterding from 'data/deterding';
import * as cifar from 'data/gray_cifar10';
import { TwoStageDictionaryLearning } from 'algorithms/TwoStageDictionaryLearning';
import { getClassificationError } from 'analysis/classification';
import { testLoad } from 'utils/csv';

const iterations = 20000;

async function execute() {
    await testLoad('.tmp/cifar10.csv');

    process.exit(0);

    const dataset = tfUtil.oneHotDataset(await cifar.load());
    console.log('loaded dataset');

    const transposed = tfUtil.transposeDataset(dataset);
    console.log('transposed dataset');

    const [ X, Y ] = transposed.train;
    const [ T, TY ] = transposed.test;

    const samples = X.shape[1];
    const features = X.shape[0];
    const classes = Y.shape[0];
    const t_samples = T.shape[1];
    const hidden = 2;

    console.log('Samples:', samples, 'Features:', features, 'Classes:', classes); // tslint:disable-line no-console

    const tsdl = new TwoStageDictionaryLearning(features, classes, hidden, samples, {
        stage1: {
            regD: 0.01,
        }
    });
    tsdl.train(X, Y, {
        iterations,
    });

    const TY_hat = tsdl.predict(T, { iterations });
    const Y_hat = tsdl.predict(X, { iterations });

    const trainError = getClassificationError(Y_hat.transpose(), Y.transpose());
    const testError = getClassificationError(TY_hat.transpose(), TY.transpose());
    console.log('test:', testError.get(), 'train:', trainError.get());
}

execute()
    .then(() => process.exit(0))
    .catch(e => console.log('uncaught error', e)); // tslint:disable-line no-console
