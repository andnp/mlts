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
        parameters[pair[0]] = pair[1][Math.floor(index / accum) % num];
        accum *= num;
    });
    return reconstructParameters(parameters);
}
exports.getParameterPermutation = getParameterPermutation;
function getNumberOfRuns(metaParameters) {
    const parameterPairs = flatten_1.flattenToArray(metaParameters);
    let accum = 1;
    parameterPairs.forEach(pair => accum *= pair[1].length);
    return accum;
}
exports.getNumberOfRuns = getNumberOfRuns;
//# sourceMappingURL=metaParameters.js.map