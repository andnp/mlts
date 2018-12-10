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
    run(root?: string): Observable<{
        path: string;
        tag: "test";
        type: "txt";
        data: number;
    } | {
        path: string;
        tag: "train";
        type: "txt";
        data: number;
    } | {
        path: string;
        tag: "loss";
        type: "csv";
        data: Matrix<Float32ArrayConstructor>;
    } | {
        path: string;
        tag: "params";
        type: "json";
        data: object;
    } | {
        path: string;
        tag: "experiment";
        type: "json";
        data: import("simplytyped/types/objects").ObjectType<{
            transformation?: any;
        } & Pick<import("validtyped").ObjectValidator<{
            algorithm: import("validtyped").Validator<string>;
            dataset: import("validtyped").Validator<string>;
            metaParameters: import("validtyped").Validator<Record<string, any>>;
            transformation: import("validtyped").Validator<any>;
            optimization: import("validtyped").Validator<(import("simplytyped/types/objects").ObjectType<{
                threshold?: number | undefined;
                batchSize?: number | undefined;
            } & Pick<import("validtyped").ObjectValidator<{
                threshold: import("validtyped").Validator<number>;
                iterations: import("validtyped").Validator<number>;
                batchSize: import("validtyped").Validator<number>;
            }>, "iterations">> & import("validtyped").ObjectValidator<{
                type: import("validtyped").Validator<"adadelta">;
                learningRate: import("validtyped").Validator<number>;
            }>) | (import("simplytyped/types/objects").ObjectType<{
                threshold?: number | undefined;
                batchSize?: number | undefined;
            } & Pick<import("validtyped").ObjectValidator<{
                threshold: import("validtyped").Validator<number>;
                iterations: import("validtyped").Validator<number>;
                batchSize: import("validtyped").Validator<number>;
            }>, "iterations">> & import("validtyped").ObjectValidator<{
                type: import("validtyped").Validator<"adagrad">;
                learningRate: import("validtyped").Validator<number>;
            }>) | (import("simplytyped/types/objects").ObjectType<{
                threshold?: number | undefined;
                batchSize?: number | undefined;
            } & Pick<import("validtyped").ObjectValidator<{
                threshold: import("validtyped").Validator<number>;
                iterations: import("validtyped").Validator<number>;
                batchSize: import("validtyped").Validator<number>;
            }>, "iterations">> & import("validtyped").ObjectValidator<{
                type: import("validtyped").Validator<"rmsprop">;
                learningRate: import("validtyped").Validator<number>;
            }>)>;
        }>, "algorithm" | "dataset" | "metaParameters" | "optimization">>;
    }>;
    saveResults(obs: Observable<ExperimentResultMessage>): Observable<ExperimentResultMessage>;
    printResults(obs: Observable<ExperimentResultMessage>): Observable<ExperimentResultMessage>;
}
export {};
