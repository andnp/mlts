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

        const params = alg.getParameters();

        const resultsPath = this.description.path;

        obs.next({
            tag: 'test',
            type: 'txt',
            path: `${resultsPath}/test.csv`,
            data: testError,
        });

        obs.next({
            tag: 'train',
            type: 'txt',
            path: `${resultsPath}/train.csv`,
            data: trainError,
        });

        obs.next({
            tag: 'params',
            type: 'json',
            path: `${resultsPath}/params.json`,
            data: params,
        });

        obs.next({
            tag: 'experiment',
            type: 'json',
            path: `${resultsPath}/experiment.json`,
            data: this.description.definition,
        });

        const loss = Matrix.fromData([history.loss]);

        obs.next({
            tag: 'loss',
            type: 'csv',
            path: `${resultsPath}/loss.csv`,
            data: loss,
        });
    }
}
