// tslint:disable no-console
import { getFakeClassificationDataset } from "../tests/utils";
import { ANN } from "algorithms";
import { getClassificationError } from "analysis";
import { Deterding } from "data";
import { time } from "utilities-ts";

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

    const train_err = getClassificationError(Y_hat, Y);
    const test_err = getClassificationError(TY_hat, TY);

    console.log(train_err, test_err);
}

exec().catch(console.log);
