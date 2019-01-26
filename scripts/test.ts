// tslint:disable no-console
import { getFakeClassificationDataset } from "../tests/utils";
import { ANN } from "../src/algorithms";
import { getClassificationError } from "../src/analysis";
import { Deterding } from "../src/data";
import { time } from "utilities-ts";
import { ClassificationErrorExperiment, ExperimentDescription } from "../src/index";

async function exec() {
    const dataset = await Deterding.load();
    // const dataset = getFakeClassificationDataset({
    //     samples: 100,
    //     classes: 5,
    //     features: 10,
    // });

    const alg = new ANN(dataset.description(), {
        loss: 'binaryCrossentropy',
        layers: [
            { type: 'dense', units: 7, activation: 'relu' },
        ],
    });

    const desc = ExperimentDescription.fromManualSetup(alg, dataset, {
        iterations: 100,
        batchSize: 10,
        type: 'rmsprop',
        learningRate: 0.001,
    }, 'results');

    const exp = new ClassificationErrorExperiment(desc);

    const obs = exp.run();

    ClassificationErrorExperiment.saveResults(obs);

    await obs;
}

exec().catch(console.log);
