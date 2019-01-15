import { getFakeClassificationDataset, buildClassificationTest } from "../../utils";
import { ANN } from "algorithms";
import { time } from "utilities-ts";

jest.setTimeout(time.minutes(5));

test('Can separate easy difficulty randomly generated dataset with near perfect accuracy', buildClassificationTest({
    dataset: getFakeClassificationDataset({
        samples: 100,
        classes: 5,
        features: 10,
    }, 'easy'),
    alg: new ANN({
        classes: 5,
        features: 10,
    }, {
        loss: 'categoricalCrossentropy',
        layers: [
            { type: 'dense', units: 7, activation: 'relu' },
        ],
    }),
    optimization: {
        iterations: 50,
        batchSize: 10,
        type: 'rmsprop',
        learningRate: 0.001,
    },
    error: 0.1,
}));

test('Can separate medium difficulty randomly generated dataset with high accuracy', buildClassificationTest({
    dataset: getFakeClassificationDataset({
        samples: 100,
        classes: 5,
        features: 10,
    }, 'medium'),
    alg: new ANN({
        classes: 5,
        features: 10,
    }, {
        loss: 'categoricalCrossentropy',
        layers: [
            { type: 'dense', units: 7, activation: 'relu' },
        ],
    }),
    optimization: {
        iterations: 20,
        batchSize: 10,
        type: 'rmsprop',
        learningRate: 0.001,
    },
    error: 0.2,
}));


test('Can separate hard difficulty randomly generated dataset with high accuracy', buildClassificationTest({
    dataset: getFakeClassificationDataset({
        samples: 100,
        classes: 5,
        features: 10,
    }, 'hard'),
    alg: new ANN({
        classes: 5,
        features: 10,
    }, {
        loss: 'categoricalCrossentropy',
        layers: [
            { type: 'dense', units: 7, activation: 'relu' },
        ],
    }),
    optimization: {
        iterations: 20,
        batchSize: 10,
        type: 'rmsprop',
        learningRate: 0.001,
    },
    error: 0.4,
}));
