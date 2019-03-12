import { getClassificationError } from "../analysis";
import { Matrix, RawObservable } from "utilities-ts";
import { SupervisedAlgorithm } from "../algorithms/Algorithm";
import { Experiment, ExperimentResultMessage, ParamsResultMessage, ExperimentJsonResultMessage } from "./Experiment";

export interface TestResultMessage extends ExperimentResultMessage {
    tag: 'test';
    type: 'txt';
    data: number;
}

export interface TrainResultMessage extends ExperimentResultMessage {
    tag: 'train';
    type: 'txt';
    data: number;
}

export interface LossResultMessage extends ExperimentResultMessage {
    tag: 'loss';
    type: 'idx';
    data: Matrix;
}

export interface AuxiliaryLossResultMessage extends ExperimentResultMessage {
    tag: 'aux_loss';
    type: 'idx';
    data: {
        buf: number[];
        shape: [number];
    };
}

export type ClassificationErrorResultMessage =
     | TestResultMessage
     | TrainResultMessage
     | LossResultMessage
     | AuxiliaryLossResultMessage
     | ParamsResultMessage
     | ExperimentJsonResultMessage;

export class ClassificationErrorExperiment extends Experiment {
    protected async _run(obs: RawObservable<ClassificationErrorResultMessage>) {
        const alg = this.description.algorithm;
        const d = this.description.dataset;

        if (!(alg instanceof SupervisedAlgorithm)) throw new Error('Can only work with supervised algorithms');

        const [ X, Y ] = d.train;

        const history = await alg.train(X, Y, this.description.optimization, d.test);

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

        const loss = history.loss;
        obs.next({
            tag: 'aux_loss',
            type: 'idx',
            path: `loss.idx`,
            data: { buf: loss, shape: [loss.length] },
        });

        for (const k of Object.keys(history.other)) {
            const loss = history.other[k];
            obs.next({
                tag: 'aux_loss',
                type: 'idx',
                path: `${k}.idx`,
                data: { buf: loss, shape: [loss.length] },
            });
        }
    }
}
