import { PlainObject } from 'simplytyped';
import { Result } from './collectResults';

import * as _ from 'lodash';

export type Lens = (o: PlainObject) => any;
export const lens = (k: string): Lens => (o: PlainObject) => _.get(o, k);

export const createAlgorithmDatasetFilter = (alg: string, data: string) => _.flow(
    _.partial(where, lens('dataset'), data),
    _.partial(where, lens('algorithm'), alg),
);

export function where(l: Lens, value: any, res: Result[]) {
    return res.filter(result => l(result) === value);
}

const numericAscending = (a: number, b: number) => a - b;

export const parameterLens = lens('metaParameters');

type ResultReducer = (a: Result, b: Result) => Result;
type ResultReducerCreator = (name: string) => ResultReducer;

const meanLens = _.flow(
    lens('description'),
    lens('mean'),
);

export const createMinMeanReducer: ResultReducerCreator = (file: string) => {
    const minMeanLens = _.flow(
        lens(file),
        meanLens,
    );

    return (a, b) => {
        return minMeanLens(a) < minMeanLens(b)
            ? a
            : b;
    };
};

export function group(p_lens: Lens, reducer: ResultReducer, res: Result[]) {
    const values = res.map(p_lens);
    const uniqueValues = _.uniq(values).sort(numericAscending);

    const matched = uniqueValues.map(v => res.filter(r => p_lens(r) === v));

    return matched.map(group => {
        return group.reduce((p, c) => {
            return reducer(p, c);
        }, group[0]);
    });
}
