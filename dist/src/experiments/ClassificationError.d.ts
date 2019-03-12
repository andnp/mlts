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
export declare type ClassificationErrorResultMessage = TestResultMessage | TrainResultMessage | LossResultMessage | AuxiliaryLossResultMessage | ParamsResultMessage | ExperimentJsonResultMessage;
export declare class ClassificationErrorExperiment extends Experiment {
    protected _run(obs: RawObservable<ClassificationErrorResultMessage>): Promise<void>;
}
