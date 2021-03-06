import * as _ from 'lodash';
import { flattenToArray } from '../utils/flatten';

// --------------------------------------------
// Compute the MetaParameters used for this run
// --------------------------------------------

export function reconstructParameters(params: Record<string, any>) {
    const res: Record<string, any> = {};
    const keys = Object.keys(params);
    keys.forEach(k => {
        _.set(res, k, params[k]);
    });

    return res;
}

export function getParameterPermutation(metaParameters: any, index: number): any {
    // this gives us a list of pairs.
    // each pair is of form [ 'path.to.thing', arrayOfValues ]
    const parameterPairs = flattenToArray(metaParameters);

    const parameters: Record<string, any> = {};
    let accum = 1;
    parameterPairs.forEach(pair => {
        const num = pair[1].length;

        // if we have an empty array for a parameter, then add that parameter back as an empty array.
        // if we do not skip it, then the below accumulant becomes 0; causing many issues
        if (num === 0) {
            parameters[pair[0]] = [];
            return;
        }
        parameters[pair[0]] = pair[1][Math.floor(index / accum) % num];
        accum *= num;
    });

    return reconstructParameters(parameters);
}

export function getNumberOfRuns(metaParameters: any): number {
    const parameterPairs = flattenToArray(metaParameters);
    let accum = 1;
    parameterPairs.forEach(pair => accum *= pair[1].length || 1);
    return accum;
}
