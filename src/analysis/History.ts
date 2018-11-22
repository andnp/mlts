import * as tf from '@tensorflow/tfjs';
import { lens } from '../utils/fp';

const lossLens = lens('history.loss');

export class History {
    constructor(
        public name: string,
        public params: {},
        public loss: number[],
    ) {}

    static fromTensorflowHistory(name: string, params: {}, hist: tf.History) {
        return History.fromTensorflowHistories(name, params, [hist]);
    }

    static fromTensorflowHistories(name: string, params: {}, hists: tf.History[]) {
        const rawHists = hists.map(hist => {
            const loss = lossLens(hist);
            if (typeof loss[0] !== 'number') throw new Error(`I don't know how to deal with tensor histories`);

            return { loss: loss as number[] };
        });

        const loss = rawHists.reduce((coll, hist) => coll.concat(hist.loss), [] as number[]);

        return new History(name, params, loss);
    }

    static initializeEmpty(name: string, params: {}) {
        return new History(name, params, []);
    }
}
