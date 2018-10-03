import * as tf from '@tensorflow/tfjs';
import { TensorflowDataset } from 'data';

const createSmallDataset = () => {
    const x = tf.tensor2d([
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9],
        [1, 1, 1],
    ]);

    const y = tf.tensor2d([
        [0, 1],
        [1, 0],
        [1, 0],
        [1, 0],
    ]);

    const t = tf.tensor2d([
        [3, 2, 1],
        [6, 5, 4],
    ]);
    const ty = tf.tensor2d([
        [1, 0],
        [0, 1],
    ]);

    return new TensorflowDataset(x, y, t, ty);
};

test('Can create a dataset out of tensors', () => {
    const data = createSmallDataset();

    expect(data).toBeTruthy();
});

test('Can get description of the dataset sizes', () => {
    const data = createSmallDataset();

    expect(data.samples).toBe(4);
    expect(data.features).toBe(3);
    expect(data.classes).toBe(2);
    expect(data.testSamples).toBe(2);

    expect(data.description()).toEqual({
        samples: 4,
        features: 3,
        classes: 2,
        testSamples: 2,
    });
});

test('Can reduce the size of the training samples', () => {
    const data = createSmallDataset();

    data.limitSamples(1);

    expect(data.samples).toBe(1);
    expect(data.testSamples).toBe(2);

    const x = data.train[0];

    expect(x.shape[0]).toBe(1);
});

test('Can draw stratified samples by class', () => {
    const data = createSmallDataset();

    data.stratify().limitSamples(3);

    expect(data.samples).toBe(3);

    const [X, Y] = data.train;

    expect(X.shape[0]).toBe(3);
    expect(Y.shape[0]).toBe(3);

    expect(Y.get(0, 0)).toBe(1);
    expect(Y.get(0, 1)).toBe(0);
    expect(Y.get(1, 1)).toBe(1);
    expect(Y.get(2, 0)).toBe(1);
});
