import { Color, Palette } from 'tsplot';
import { Lens } from '../results/processing';
import { Result } from '../results/collectResults';
declare type Line = string | number | {
    name: string | number;
    color: Color;
};
export declare const numericAscending: (a: number, b: number) => number;
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
export declare function parameterSensitivity(o: ParameterSensitivityOptions): {
    test: import("tsplot/src/utils/PlotlyCharts").Chart;
    train: import("tsplot/src/utils/PlotlyCharts").Chart;
    palette: Palette;
};
export {};
