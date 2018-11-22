"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fp_1 = require("../utils/fp");
const _ = require("lodash");
exports.lens = fp_1.lens;
exports.createAlgorithmDatasetFilter = (alg, data) => _.flow(_.partial(where, exports.lens('dataset'), data), _.partial(where, exports.lens('algorithm'), alg));
function where(l, value, res) {
    return res.filter(result => l(result) === value);
}
exports.where = where;
function whereNot(l, value, res) {
    return res.filter(result => l(result) !== value);
}
exports.whereNot = whereNot;
const numericAscending = (a, b) => a - b;
exports.parameterLens = exports.lens('metaParameters');
const meanLens = _.flow(exports.lens('description'), exports.lens('mean'));
exports.createMinMeanReducer = (file) => {
    const minMeanLens = _.flow(exports.lens(file), meanLens);
    return (a, b) => {
        return minMeanLens(a) < minMeanLens(b)
            ? a
            : b;
    };
};
function group(p_lens, reducer, res) {
    const values = res.map(p_lens);
    const uniqueValues = _.uniq(values).sort(numericAscending);
    const matched = uniqueValues.map(v => res.filter(r => p_lens(r) === v));
    return matched.map(group => {
        return group.reduce((p, c) => {
            return reducer(p, c);
        }, group[0]);
    });
}
exports.group = group;
//# sourceMappingURL=processing.js.map