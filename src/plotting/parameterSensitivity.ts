// tslint:disable no-console
import * as _ from 'lodash';
import { Color, createStandardPalette, LineChart, combineTraces, Palette, Chart } from 'tsplot';
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

    resultFiles?: string[];
    reducerFile?: string;

    results: Result[];
}

export function parameterSensitivity(o: ParameterSensitivityOptions): Record<string, Chart> {
    const l_lens = o.line_lens || (() => '');
    const prefix = o.linePrefix || '';
    const lines = o.lines || sortedUniq(o.results.map(l_lens));
    const resultFiles = o.resultFiles || ['train.csv', 'test.csv'];
    const reducerFile = o.reducerFile || 'train.csv';

    const res = o.results;
    const x_lens = o.x_lens;

    const palette = o.palette || createStandardPalette(lines.length);

    const tracesOrUndefined = lines.map(line => {
        const { name, color } = typeof line === 'string' || typeof line === 'number'
            ? { name: line, color: palette.next() }
            : line;

        const filtered = where(l_lens, name, res);

        if (filtered.length === 0) return;

        const minMeanReducer = createMinMeanReducer(reducerFile);

        const grouped = group(x_lens, minMeanReducer, filtered);
        const x_values = sortedUniq(filtered.map(x_lens));

        const linePlots = resultFiles.reduce((coll, resultFile) => {
            const stats = grouped.map(_.flow(
                lens(resultFile),
                lens('description'),
            ));

            const line = LineChart.fromArrayStats(stats);
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
        }, {} as Record<string, LineChart>);

        return linePlots;
    });

    const traces = arrays.filterUndefined(tracesOrUndefined);

    return resultFiles.reduce((coll, resultFile) => {
        const resultFileName = resultFile.replace('.csv', '');
        const comb = combineTraces(traces.map(fp.prop(resultFileName)), 'experiment');
        return {
            ...coll,
            [resultFileName]: comb,
        };
    }, {} as Record<string, Chart>);
}
