"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
exports.lens = (k) => (o) => _.get(o, k);
exports.createAlgorithmDatasetFilter = (alg, data) => _.flow(_.partial(where, exports.lens('dataset'), data), _.partial(where, exports.lens('algorithm'), alg));
function where(l, value, res) {
    return res.filter(result => l(result) === value);
}
exports.where = where;
const numericAscending = (a, b) => a - b;
const parameterLens = exports.lens('metaParameters');
const meanLens = _.flow(exports.lens('description'), exports.lens('mean'));
exports.createMinMeanReducer = (file) => {
    const minMeanLens = _.flow(exports.lens(file), meanLens);
    return (a, b) => {
        return minMeanLens(a) < minMeanLens(b)
            ? a
            : b;
    };
};
function groupByParameter(p_lens, resultFiles, reducer, res) {
    const p = _.flow(parameterLens, p_lens);
    const values = res.map(p);
    const uniqueValues = _.uniq(values).sort(numericAscending);
    const matched = uniqueValues.map(v => res.filter(r => p(r) === v));
    const reducerLens = exports.lens(resultFiles[0]);
    return matched.map(group => {
        // reduce by min first resultFile
        return group.reduce((p, c) => {
            return reducer(reducerLens(p), reducerLens(c));
        }, group[0]);
    });
}
exports.groupByParameter = groupByParameter;
//# sourceMappingURL=processing.js.map