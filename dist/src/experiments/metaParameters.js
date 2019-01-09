"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const flatten_1 = require("../utils/flatten");
// --------------------------------------------
// Compute the MetaParameters used for this run
// --------------------------------------------
function reconstructParameters(params) {
    const res = {};
    const keys = Object.keys(params);
    keys.forEach(k => {
        _.set(res, k, params[k]);
    });
    return res;
}
exports.reconstructParameters = reconstructParameters;
function getParameterPermutation(metaParameters, index) {
    // this gives us a list of pairs.
    // each pair is of form [ 'path.to.thing', arrayOfValues ]
    const parameterPairs = flatten_1.flattenToArray(metaParameters);
    const parameters = {};
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
exports.getParameterPermutation = getParameterPermutation;
function getNumberOfRuns(metaParameters) {
    const parameterPairs = flatten_1.flattenToArray(metaParameters);
    let accum = 1;
    parameterPairs.forEach(pair => accum *= pair[1].length || 1);
    return accum;
}
exports.getNumberOfRuns = getNumberOfRuns;
//# sourceMappingURL=metaParameters.js.map