"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const algorithms_1 = require("algorithms");
const analysis_1 = require("analysis");
const data_1 = require("data");
async function exec() {
    const dataset = await data_1.Deterding.load();
    // const dataset = getFakeClassificationDataset({
    //     samples: 100,
    //     classes: 5,
    //     features: 10,
    // });
    const alg = new algorithms_1.ANN(dataset.description(), {
        loss: 'binaryCrossentropy',
        layers: [
            { type: 'dense', units: 7, activation: 'relu' },
        ],
    });
    const [X, Y] = dataset.train;
    X.print(true);
    Y.print(true);
    await alg.train(X, Y, {
        iterations: 100,
        batchSize: 10,
        type: 'rmsprop',
        learningRate: 0.001,
    });
    const Y_hat = await alg.predict(X);
    const [T, TY] = dataset.test;
    const TY_hat = await alg.predict(T);
    const train_err = analysis_1.getClassificationError(Y_hat, Y);
    const test_err = analysis_1.getClassificationError(TY_hat, TY);
    console.log(train_err, test_err);
}
exec().catch(console.log);
//# sourceMappingURL=test.js.map