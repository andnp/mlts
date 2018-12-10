import { ExperimentDescription } from "./ExperimentDescription";
import { getClassificationError } from "../analysis";
import { files, csv, Matrix, RawObservable } from "utilities-ts";
import { SupervisedAlgorithm } from "../algorithms/Algorithm";
import { Experiment, ExperimentResultMessage } from "./Experiment";

export class ClassificationErrorExperiment extends Experiment {
    async _run(obs: RawObservable<ExperimentResultMessage>) {
        const alg = this.description.algorithm;
        const d = this.description.dataset;

        if (!(alg instanceof SupervisedAlgorithm)) throw new Error('Can only work with supervised algorithms');

        const [ X, Y ] = d.train;

        const history = await alg.train(X, Y, this.description.optimization);

        const [ T, TY ] = d.test;

        const Y_hat = await alg.predict(X, this.description.optimization);
        const TY_hat = await alg.predict(T, this.description.optimization);

        const trainError = getClassificationError(Y_hat, Y).get();
        const testError = getClassificationError(TY_hat, TY).get();

        obs.next({
            tag: 'test',
            type: 'txt',
            path: `test.csv`,
            data: testError,
        });

        obs.next({
            tag: 'train',
            type: 'txt',
            path: `train.csv`,
            data: trainError,
        });

        const loss = Matrix.fromData([history.loss]);

        obs.next({
            tag: 'loss',
            type: 'csv',
            path: `loss.csv`,
            data: loss,
        });
    }
}
