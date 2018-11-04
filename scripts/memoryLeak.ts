// tslint:disable no-console
/*
Tensorflow used to have a memory leak whenever fitting a model.
At the end of every epoch, one tensor would be leaked with 4 bytes.
This caused the graph to grow extremely large while training certain models,
and caused a dramatic speed decrease over time.

It appears to be fixed now, but I'm leaving this script so that it is easy
to test for the same (or similar) leaks in the future.
*/

import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-node';
import { Deterding } from '../src/data/tensorflow/Deterding';

class LeakDetection extends tf.Callback {
    async onEpochEnd() {
        const m = tf.memory();
        console.log(m);
    }
}

const execute = async () => {
    const data = await Deterding.load();
    const [ X, Y ] = data.train;

    const {
        features,
        classes,
    } = data.description();

    const inputs = tf.layers.input({ shape: [features] });
    const h = tf.layers.dense({ units: 10, activation: 'relu' }).apply(inputs);
    const outputs = tf.layers.dense({ units: classes, activation: 'sigmoid' }).apply(h) as tf.SymbolicTensor;

    const model = tf.model({ inputs, outputs });

    model.compile({
        loss: 'binaryCrossentropy',
        optimizer: 'rmsprop',
    });

    await model.fit(X, Y, {
        epochs: 100,
        callbacks: [new LeakDetection()],
    });
};

console.log('here');

execute().catch(console.log).then(() => process.exit(0));
