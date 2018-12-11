import { Matrix, RawObservable } from "utilities-ts";
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
    type: 'csv';
    data: Matrix;
}
export declare type ClassificationErrorResultMessage = TestResultMessage | TrainResultMessage | LossResultMessage | ParamsResultMessage | ExperimentJsonResultMessage;
export declare class ClassificationErrorExperiment extends Experiment {
    _run(obs: RawObservable<ClassificationErrorResultMessage>): Promise<void>;
}
