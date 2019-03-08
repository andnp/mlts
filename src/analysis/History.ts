import * as tf from '@tensorflow/tfjs';
import * as _ from 'lodash';
import { lens } from '../utils/fp';

const historyLens = lens('history');
const lossLens = (name: string) => _.flow(
    historyLens,
    lens(name),
);

export class History {
    other: Record<string, number[]>;
    constructor(
        public name: string,
        public params: {},
        public loss: number[],
        other?: Record<string, number[]>,
    ) {
        this.other = other || {};
    }

    static fromTensorflowHistory(name: string, params: {}, hist: tf.History, collect?: string[]) {
        return History.fromTensorflowHistories(name, params, [hist], collect);
    }

    static fromTensorflowHistories(name: string, params: {}, hists: tf.History[], collect?: string[]) {
        const collectValues = (name: string) => {
            const rawHists = hists.map(hist => {
                const loss = lossLens(name)(hist);
                if (typeof loss[0] !== 'number') throw new Error(`I don't know how to deal with tensor histories`);

                return { loss: loss as number[] };
            });

            const loss = rawHists.reduce((coll, hist) => coll.concat(hist.loss), [] as number[]);
            return loss;
        };

        const loss = collectValues('loss');
        if (!collect) return new History(name, params, loss);

        const other = collect.reduce((coll, name) => {
            return {
                [name]: collectValues(name),
                ...coll,
            };
        }, {} as Record<string, number[]>);

        return new History(name, params, loss, other);
    }

    static initializeEmpty(name: string, params: {}) {
        return new History(name, params, []);
    }
}
