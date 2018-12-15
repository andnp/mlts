import { Palette } from 'tsplot';
import { Lens } from '../results/processing';
import { Result } from '../results/collectResults';
interface LearningCurveOptions {
    lineNameLens?: Lens;
    palette?: Palette;
    lineFile: string;
    results: Result[];
}
export declare function learningCurve(o: LearningCurveOptions): Promise<import("tsplot/src/utils/PlotlyCharts").Chart>;
export {};
