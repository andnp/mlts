// tslint:disable no-console
import { Observable, RawObservable, Matrix, files, csv, assertNever } from "utilities-ts";
import { ExperimentDescription } from "./ExperimentDescription";
import { ExperimentJson } from "./ExperimentSchema";

interface BaseMessage {
    tag: string;
    type: string;
    path: string;
    data: any;
}

export interface TestResultMessage extends BaseMessage {
    tag: 'test';
    type: 'txt';
    data: number;
}

export interface TrainResultMessage extends BaseMessage {
    tag: 'train';
    type: 'txt';
    data: number;
}

export interface LossResultMessage extends BaseMessage {
    tag: 'loss';
    type: 'csv';
    data: Matrix;
}

export interface ParamsResultMessage extends BaseMessage {
    tag: 'params';
    type: 'json';
    data: object;
}

export interface ExperimentJsonResultMessage extends BaseMessage {
    tag: 'experiment';
    type: 'json';
    data: ExperimentJson;
}

export type ExperimentResultMessage =
    | TestResultMessage
    | TrainResultMessage
    | LossResultMessage
    | ParamsResultMessage
    | ExperimentJsonResultMessage;

export abstract class Experiment {
    constructor(
        protected description: ExperimentDescription,
    ) {}

    protected abstract async _run(obs: RawObservable<ExperimentResultMessage>): Promise<void>;

    run(root = ''): Observable<ExperimentResultMessage> {
        const obs = Observable.create<ExperimentResultMessage>(creator => this._run(creator).then(creator.end));

        // prefix all of the paths with the root path
        // before passing the message on to the consumer
        return obs.map(msg => ({
            ...msg,
            path: `${this.description.resultsBase}/${root}/${msg.path}`,
        }));
    }

    static saveResults(obs: Observable<ExperimentResultMessage>) {
        return obs.subscribe(msg => {
            if (msg.type === 'txt') return files.writeFile(msg.path, msg.data);
            if (msg.type === 'json') return files.writeJson(msg.path, msg.data);
            if (msg.type === 'csv') return csv.writeCsv(msg.path, msg.data);

            throw assertNever(msg);
        });
    }

    static printResults(obs: Observable<ExperimentResultMessage>) {
        return obs.subscribe(msg => {
            if (msg.tag === 'train') return console.log(`Train Error: ${msg.data}`);
            if (msg.tag === 'test' ) return console.log(`Test Error: ${msg.data}`);
        });
    }
}
