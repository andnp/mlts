"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// tslint:disable no-console
const _ = require("lodash");
const processing_1 = require("./processing");
const collectResults_1 = require("./collectResults");
exports.createParameterFilter = (fixed) => {
    const filters = Object.keys(fixed).map(key => {
        const filterLens = _.flow(processing_1.parameterLens, processing_1.lens(key));
        return _.partial(processing_1.where, filterLens, fixed[key]);
    });
    return _.flow(...filters);
};
const collect = _.memoize((path, resultFiles) => {
    return collectResults_1.collectResults(path, resultFiles);
});
exports.collectAndFilter = async (path, resultFiles, filter) => {
    const res = await collect(path, resultFiles).collect();
    console.log(`Found <${res.length}> result files`);
    const countLens = _.flow(processing_1.lens('train.csv'), processing_1.lens('description'), processing_1.lens('count'));
    const filtered = filter(res);
    console.log(`Filtered down to <${filtered.length}> results`);
    const totalFiles = filtered.map(countLens).reduce((t, x) => t + x, 0);
    console.log(`With <${totalFiles}> total files`);
    return filtered;
};
//# sourceMappingURL=resultsGathering.js.map