import * as tf from '@tensorflow/tfjs';
import { Dataset } from 'mlts-experiment-data';
import { AnyFunc } from 'simplytyped';
import { BaseCallback } from '@tensorflow/tfjs-layers/dist/base_callbacks';
import { UnresolvedLogs } from '@tensorflow/tfjs-layers/dist/logs';
import { Printer } from './printer';
import { DataTensor } from 'mlts-experiment-data/dist/src/Data';
export declare function autoDispose<F extends AnyFunc>(f: F): F;
export declare const dataToTensor2d: (m: DataTensor) => tf.Tensor<tf.Rank.R2>;
export declare const datasetToTFDataset: (dataset: Dataset) => {
    train: tf.Tensor<tf.Rank.R2>[];
    test: tf.Tensor<tf.Rank.R2>[];
};
export declare function writeTensorToCsv(location: string, tensor: tf.Tensor2D): Promise<void>;
declare type BufferConstructor = Float32ArrayConstructor | Int32ArrayConstructor | Uint8ArrayConstructor;
export declare function loadTensorFromCsv(location: string, shape: [number, number], Buffer?: BufferConstructor): Promise<tf.Tensor<tf.Rank.R2>>;
export declare function randomInitVariable(shape: [number, number]): tf.Variable<tf.Rank.R2>;
export declare function randomSamples(X: tf.Tensor2D, numSamples: number): tf.Tensor<tf.Rank.R2>;
export declare class LoggerCallback extends BaseCallback {
    private print;
    private startingEpoch;
    private epoch;
    private batch;
    private trainingBegan;
    constructor(print: Printer, startingEpoch?: number);
    onBatchEnd(batch: number, logs?: UnresolvedLogs): Promise<void>;
    onEpochBegin(): Promise<void>;
    onEpochEnd(): Promise<void>;
}
export declare class EpochCounter extends BaseCallback {
    private callback;
    constructor(callback: () => void);
    onEpochEnd(): Promise<void>;
}
export {};
