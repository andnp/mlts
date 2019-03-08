import * as tf from '@tensorflow/tfjs';
export declare class History {
    name: string;
    params: {};
    loss: number[];
    other: Record<string, number[]>;
    constructor(name: string, params: {}, loss: number[], other?: Record<string, number[]>);
    static fromTensorflowHistory(name: string, params: {}, hist: tf.History, collect?: string[]): History;
    static fromTensorflowHistories(name: string, params: {}, hists: tf.History[], collect?: string[]): History;
    static initializeEmpty(name: string, params: {}): History;
}
