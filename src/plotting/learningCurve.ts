// tslint:disable no-console
import { combineTraces, createStandardPalette, describeColumns, LineChart, Palette } from 'tsplot';
import { promise, csv, files, Matrix } from 'utilities-ts';
import { Lens } from '../results/processing';
import { Result } from '../results/collectResults';

interface LearningCurveOptions {
    lineNameLens?: Lens;
    palette?: Palette;
    lineFile: string;
    results: Result[];
}

export async function learningCurve(o: LearningCurveOptions) {
    // -----------
    // Create Plot
    // -----------
    const palette = o.palette || createStandardPalette();

    const plots = await promise.map(o.results, async (result) => {
        const path = result.path.split('/').slice(0, -1).join('/');
        // collect losses
        const paths = await files.glob(`${path}/**/${o.lineFile}`);
        const losses = await promise.map(paths, p => csv.load(p));
        const loss = Matrix.concat(losses);

        const lossStats = describeColumns(loss);
        const lossLine = LineChart.fromArrayStats(lossStats);
        lossLine.setColor(palette.next());

        if (o.lineNameLens) lossLine.label(o.lineNameLens(result));

        return lossLine;
    });

    return combineTraces(plots, '');
}
