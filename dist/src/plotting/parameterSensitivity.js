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
const trainDescriptionLens = _.flow(processing_1.lens('train.csv'), processing_1.lens('description'));
const testDescriptionLens = _.flow(processing_1.lens('test.csv'), processing_1.lens('description'));
function parameterSensitivity(o) {
    const l_lens = o.line_lens || (() => '');
    const prefix = o.linePrefix || '';
    const lines = o.lines || sortedUniq(o.results.map(l_lens));
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
        const minMeanReducer = processing_1.createMinMeanReducer('train.csv');
        const grouped = processing_1.group(x_lens, minMeanReducer, filtered);
        const x_values = sortedUniq(filtered.map(x_lens));
        const trainStats = grouped.map(trainDescriptionLens);
        const testStats = grouped.map(testDescriptionLens);
        const trainLine = tsplot_1.LineChart.fromArrayStats(trainStats);
        trainLine.setXValues(x_values);
        trainLine.setColor(color);
        const testLine = tsplot_1.LineChart.fromArrayStats(testStats);
        testLine.setXValues(x_values);
        testLine.setColor(color);
        // don't bother creating an entry in the legend if there isn't a name for this algorithm
        if (name || prefix) {
            trainLine.label(`${prefix}${name}`);
            testLine.label(`${prefix}${name}`);
        }
        return { trainLine, testLine };
    });
    const traces = utilities_ts_1.arrays.filterUndefined(tracesOrUndefined);
    const train = tsplot_1.combineTraces(traces.map(utilities_ts_1.fp.prop('trainLine')), 'experiment');
    const test = tsplot_1.combineTraces(traces.map(utilities_ts_1.fp.prop('testLine')), 'experiment');
    train.yLabel('Classification Error');
    test.yLabel('Classification Error');
    return { test, train, palette };
}
exports.parameterSensitivity = parameterSensitivity;
//# sourceMappingURL=parameterSensitivity.js.map