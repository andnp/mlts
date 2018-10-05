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

const parameterLens = lens('metaParameters');

type ResultReducer = (a: Result, b: Result) => Result;
type ResultReducerCreator = (name: string) => ResultReducer;

const meanLens = _.flow(
    lens('description'),
    lens('mean'),
);

export const createMinMeanReducer: ResultReducerCreator = (file: string) => {
    const minMeanLens = _.flow(
        lens(name),
        meanLens,
    );

    return (a, b) => {
        return minMeanLens(a) < minMeanLens(b)
            ? a
            : b;
    };
};

export function groupByParameter(p_lens: Lens, resultFiles: string[], reducer: ResultReducer, res: Result[]) {
    const p = _.flow(parameterLens, p_lens);

    const values = res.map(p);
    const uniqueValues = _.uniq(values).sort(numericAscending);

    const matched = uniqueValues.map(v => res.filter(r => p(r) === v));

    const reducerLens = lens(resultFiles[0]);

    return matched.map(group => {
        // reduce by min first resultFile

        return group.reduce((p, c) => {
            return reducer(reducerLens(p), reducerLens(c));
        }, group[0]);
    });
}
