// tslint:disable no-console
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-node';
import { ANN, Deterding, getClassificationError } from '../src';

async function execute() {
    const d = await Deterding.load();
    // const alg = new ANN(d.description());
    const alg = await ANN.fromSavedState('savedModels');

    const [ X, Y ] = d.train;
    await alg.train(X, Y, { iterations: 100 });

    const [ T, TY ] = d.test;

    const Y_hat = await alg.predict(X);
    const TY_hat = await alg.predict(T);

    const testError = getClassificationError(TY_hat, TY);
    const trainError = getClassificationError(Y_hat, Y);

    console.log('train:', trainError.get(), 'test:', testError.get());
}

execute().then(() => process.exit(0));
