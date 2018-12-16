"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// tslint:disable no-console
const _ = require("lodash");
const tsplot_1 = require("tsplot");
const utilities_ts_1 = require("utilities-ts");
const processing_1 = require("../results/processing");
exports.numericAscending = (a, b) => a - b;
function sortedUniq(arr) {
    const uniq = _.uniq(arr);
    if (typeof arr[0] === 'string') {
        return uniq.sort();
    }
    else if (typeof arr[0] === 'number') {
        return uniq.sort(exports.numericAscending);
    }
    else {
        return uniq.sort();
    }
}
function parameterSensitivity(o) {
    const l_lens = o.line_lens || (() => '');
    const prefix = o.linePrefix || '';
    const lines = o.lines || sortedUniq(o.results.map(l_lens));
    const resultFiles = o.resultFiles || ['train.csv', 'test.csv'];
    const reducerFile = o.reducerFile || 'train.csv';
    const res = o.results;
    const x_lens = o.x_lens;
    const palette = o.palette || tsplot_1.createStandardPalette(lines.length);
    const tracesOrUndefined = lines.map(line => {
        const { name, color } = typeof line === 'string' || typeof line === 'number'
            ? { name: line, color: palette.next() }
            : line;
        const filtered = processing_1.where(l_lens, name, res);
        if (filtered.length === 0)
            return;
        const minMeanReducer = processing_1.createMinMeanReducer(reducerFile);
        const grouped = processing_1.group(x_lens, minMeanReducer, filtered);
        const x_values = sortedUniq(filtered.map(x_lens));
        const linePlots = resultFiles.reduce((coll, resultFile) => {
            const stats = grouped.map(_.flow(processing_1.lens(resultFile), processing_1.lens('description')));
            const line = tsplot_1.LineChart.fromArrayStats(stats);
            line.setXValues(x_values);
            line.setColor(color);
            // don't bother creating an entry in the legend if there isn't a name for this algorithm
            if (name || prefix) {
                line.label(`${prefix}${name}`);
            }
            const resultFileName = resultFile.replace('.csv', '');
            return {
                ...coll,
                [resultFileName]: line,
            };
        }, {});
        return linePlots;
    });
    const traces = utilities_ts_1.arrays.filterUndefined(tracesOrUndefined);
    return resultFiles.reduce((coll, resultFile) => {
        const resultFileName = resultFile.replace('.csv', '');
        const comb = tsplot_1.combineTraces(traces.map(utilities_ts_1.fp.prop(resultFileName)), 'experiment');
        return {
            ...coll,
            [resultFileName]: comb,
        };
    }, {});
}
exports.parameterSensitivity = parameterSensitivity;
//# sourceMappingURL=parameterSensitivity.js.map