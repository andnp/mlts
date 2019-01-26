"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const algorithms_1 = require("../src/algorithms");
const data_1 = require("../src/data");
const index_1 = require("../src/index");
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
    const desc = index_1.ExperimentDescription.fromManualSetup(alg, dataset, {
        iterations: 100,
        batchSize: 10,
        type: 'rmsprop',
        learningRate: 0.001,
    }, 'results');
    const exp = new index_1.ClassificationErrorExperiment(desc);
    const obs = exp.run();
    index_1.ClassificationErrorExperiment.saveResults(obs);
    await obs;
}
exec().catch(console.log);
//# sourceMappingURL=test.js.map