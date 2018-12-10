import { Observable, RawObservable, Matrix } from "utilities-ts";
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
export declare type ExperimentResultMessage = TestResultMessage | TrainResultMessage | LossResultMessage | ParamsResultMessage | ExperimentJsonResultMessage;
export declare abstract class Experiment {
    protected description: ExperimentDescription;
    constructor(description: ExperimentDescription);
    protected abstract _run(obs: RawObservable<ExperimentResultMessage>): Promise<void>;
    run(root?: string): Observable<ExperimentResultMessage>;
    static saveResults(obs: Observable<ExperimentResultMessage>): Observable<ExperimentResultMessage>;
    static printResults(obs: Observable<ExperimentResultMessage>): Observable<ExperimentResultMessage>;
}
export {};
