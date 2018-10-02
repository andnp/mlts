import * as tf from '@tensorflow/tfjs';

export class History {
    constructor(
        public name: string,
        public params: {},
        public loss: number[],
    ) {}

    static fromTensorflowHistory(name: string, params: {}, hist: tf.History) {
        if (typeof hist.history.loss[0] !== 'number') throw new Error(`I don't know how to deal with tensor histories`);
        return new History(name, params, hist.history.loss as number[]);
    }

    static initializeEmpty(name: string, params: {}) {
        return new History(name, params, []);
    }
}
