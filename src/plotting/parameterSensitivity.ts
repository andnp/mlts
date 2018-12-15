// tslint:disable no-console
import * as _ from 'lodash';
import { Color, createStandardPalette, LineChart, combineTraces, Palette } from 'tsplot';
import { arrays, fp } from 'utilities-ts';
import { lens, Lens, where, createMinMeanReducer, group } from '../results/processing';
import { Result } from '../results/collectResults';

type Line = string | number | {
    name: string | number;
    color: Color;
};

export const numericAscending = (a: number, b: number) => a - b;

function sortedUniq<T extends string | number>(arr: T[]): T[] {
    const uniq = _.uniq(arr);
    if (typeof arr[0] === 'string') {
        return uniq.sort();
    } else if (typeof arr[0] === 'number') {
        return (uniq as any).sort(numericAscending);
    } else {
        return uniq.sort();
    }
}

const trainDescriptionLens = _.flow(
    lens('train.csv'),
    lens('description'),
);

const testDescriptionLens = _.flow(
    lens('test.csv'),
    lens('description'),
);

export interface ParameterSensitivityOptions {
    /**
     * Function that is used to find x-axis value for a result.
     */
    x_lens: Lens;

    /**
     * Function that is used to partition results into individual lines.
     */
    line_lens?: Lens;

    /**
     * Either the value to compare to the output of `line_lens`,
     * or an object defining the value and color of the line
     */
    lines?: Line[];

    /**
     * The string to prefix each line name
     */
    linePrefix?: string;

    /**
     * The color palette for line colors.
     * This can be specified when color state needs to be maintained
     * between multiple plots.
     */
    palette?: Palette;

    results: Result[];
}

export function parameterSensitivity(o: ParameterSensitivityOptions) {
    const l_lens = o.line_lens || (() => '');
    const prefix = o.linePrefix || '';
    const lines = o.lines || sortedUniq(o.results.map(l_lens));

    const res = o.results;
    const x_lens = o.x_lens;

    const palette = o.palette || createStandardPalette(lines.length);

    const tracesOrUndefined = lines.map(line => {
        const { name, color } = typeof line === 'string' || typeof line === 'number'
            ? { name: line, color: palette.next() }
            : line;

        const filtered = where(l_lens, name, res);

        if (filtered.length === 0) return;

        const minMeanReducer = createMinMeanReducer('train.csv');

        const grouped = group(x_lens, minMeanReducer, filtered);
        const x_values = sortedUniq(filtered.map(x_lens));

        const trainStats = grouped.map(trainDescriptionLens);
        const testStats = grouped.map(testDescriptionLens);

        const trainLine = LineChart.fromArrayStats(trainStats);
        trainLine.setXValues(x_values);
        trainLine.setColor(color);

        const testLine = LineChart.fromArrayStats(testStats);
        testLine.setXValues(x_values);
        testLine.setColor(color);

        // don't bother creating an entry in the legend if there isn't a name for this algorithm
        if (name || prefix) {
            trainLine.label(`${prefix}${name}`);
            testLine.label(`${prefix}${name}`);
        }

        return { trainLine, testLine };
    });

    const traces = arrays.filterUndefined(tracesOrUndefined);

    const train = combineTraces(traces.map(fp.prop('trainLine')), 'experiment');
    const test = combineTraces(traces.map(fp.prop('testLine')), 'experiment');

    train.yLabel('Classification Error');
    test.yLabel('Classification Error');

    return { test, train, palette };
}
