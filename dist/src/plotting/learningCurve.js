"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// tslint:disable no-console
const tsplot_1 = require("tsplot");
const utilities_ts_1 = require("utilities-ts");
async function learningCurve(o) {
    // -----------
    // Create Plot
    // -----------
    const palette = o.palette || tsplot_1.createStandardPalette();
    const plots = await utilities_ts_1.promise.map(o.results, async (result) => {
        const path = result.path.split('/').slice(0, -1).join('/');
        // collect losses
        const paths = await utilities_ts_1.files.glob(`${path}/**/${o.lineFile}`);
        const losses = await utilities_ts_1.promise.map(paths, p => utilities_ts_1.csv.load(p));
        const loss = utilities_ts_1.Matrix.concat(losses);
        const lossStats = tsplot_1.describeColumns(loss);
        const lossLine = tsplot_1.LineChart.fromArrayStats(lossStats);
        lossLine.setColor(palette.next());
        if (o.lineNameLens)
            lossLine.label(o.lineNameLens(result));
        return lossLine;
    });
    return tsplot_1.combineTraces(plots, '');
}
exports.learningCurve = learningCurve;
//# sourceMappingURL=learningCurve.js.map