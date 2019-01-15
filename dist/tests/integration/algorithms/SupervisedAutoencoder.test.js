"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../../utils");
const algorithms_1 = require("algorithms");
const utilities_ts_1 = require("utilities-ts");
jest.setTimeout(utilities_ts_1.time.minutes(5));
test('Can separate easy difficulty randomly generated dataset with near perfect accuracy', utils_1.buildClassificationTest({
    dataset: utils_1.getFakeClassificationDataset({
        samples: 100,
        classes: 5,
        features: 10,
    }, 'easy'),
    alg: new algorithms_1.SupervisedAutoencoder({
        classes: 5,
        features: 10,
    }, {
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
test('Can separate medium difficulty randomly generated dataset with high accuracy', utils_1.buildClassificationTest({
    dataset: utils_1.getFakeClassificationDataset({
        samples: 100,
        classes: 5,
        features: 10,
    }, 'medium'),
    alg: new algorithms_1.SupervisedAutoencoder({
        classes: 5,
        features: 10,
    }, {
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
test('Can separate hard difficulty randomly generated dataset with high accuracy', utils_1.buildClassificationTest({
    dataset: utils_1.getFakeClassificationDataset({
        samples: 100,
        classes: 5,
        features: 10,
    }, 'hard'),
    alg: new algorithms_1.SupervisedAutoencoder({
        classes: 5,
        features: 10,
    }, {
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
//# sourceMappingURL=SupervisedAutoencoder.test.js.map