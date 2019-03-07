import { Observable, RawObservable } from "utilities-ts";
import { ExperimentDescription } from "./ExperimentDescription";
import { ExperimentJson } from "./ExperimentSchema";
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
export declare abstract class Experiment {
    protected description: ExperimentDescription;
    constructor(description: ExperimentDescription);
    protected abstract _run(obs: RawObservable<ExperimentResultMessage>): Promise<void>;
    run(root?: string): Observable<ExperimentResultMessage>;
    static saveResults(obs: Observable<ExperimentResultMessage>): Observable<ExperimentResultMessage>;
    static printResults(obs: Observable<ExperimentResultMessage>): Observable<ExperimentResultMessage>;
}
