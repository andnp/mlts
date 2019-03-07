// tslint:disable no-console
import * as fs from 'fs';
import * as idx from 'idx-data';
import { Observable, RawObservable, files, csv, assertNever } from "utilities-ts";
import { ExperimentDescription } from "./ExperimentDescription";
import { ExperimentJson } from "./ExperimentSchema";
import { interpolateResultsPath } from './fileSystem';

export interface ExperimentResultMessage {
    tag: string;
    type: 'txt' | 'csv' | 'json' | 'idx';
    path: string;
    data: any;
}

export interface ParamsResultMessage extends ExperimentResultMessage {
    tag: 'params';
    type: 'json';
    data: object;
}

export interface ExperimentJsonResultMessage extends ExperimentResultMessage {
    tag: 'experiment';
    type: 'json';
    data: ExperimentJson;
}

export abstract class Experiment {
    constructor(
        protected description: ExperimentDescription,
    ) {}

    protected abstract async _run(obs: RawObservable<ExperimentResultMessage>): Promise<void>;

    run(root = ''): Observable<ExperimentResultMessage> {
        const obs = Observable.create<ExperimentResultMessage>(creator => {
            this._run(creator).then(creator.end);

            const alg = this.description.algorithm;
            const params = alg.getParameters();

            creator.next({
                tag: 'params',
                type: 'json',
                path: `../params.json`,
                data: params,
            });

            creator.next({
                tag: 'experiment',
                type: 'json',
                path: `../experiment.json`,
                data: this.description.definition,
            });
        });

        const resultsBase = this.description.resultsBase || '';
        const path = interpolateResultsPath(this.description);

        // prefix all of the paths with the root path
        // before passing the message on to the consumer
        return obs.map(msg => ({
            ...msg,
            path: [resultsBase, root, path, msg.path].filter(s => s !== '').join('/'),
        }));
    }

    static saveResults(obs: Observable<ExperimentResultMessage>) {
        return obs.subscribe(async (msg) => {
            // reduce chances of accidentally double writing a file
            const exists = await files.fileExists(msg.path);
            if (exists) return;

            if (msg.type === 'idx') return idx.saveBits(new Float32Array(msg.data.buf), msg.data.shape, msg.path);
            if (msg.type === 'txt') return files.writeFile(msg.path, msg.data);
            if (msg.type === 'json') return files.writeJson(msg.path, msg.data);
            if (msg.type === 'csv') return csv.writeCsv(msg.path, msg.data);

            throw assertNever(msg.type);
        });
    }

    static printResults(obs: Observable<ExperimentResultMessage>) {
        return obs.subscribe(msg => {
            if (msg.tag === 'train') return console.log(`Train Error: ${msg.data}`);
            if (msg.tag === 'test' ) return console.log(`Test Error: ${msg.data}`);
        });
    }
}
