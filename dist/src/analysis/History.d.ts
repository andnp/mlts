import * as tf from '@tensorflow/tfjs';
export declare class History {
    name: string;
    params: {};
    loss: number[];
    constructor(name: string, params: {}, loss: number[]);
    static fromTensorflowHistory(name: string, params: {}, hist: tf.History): History;
    static fromTensorflowHistories(name: string, params: {}, hists: tf.History[]): History;
    static initializeEmpty(name: string, params: {}): History;
}
