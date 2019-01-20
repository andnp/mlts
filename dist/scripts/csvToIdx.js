"use strict";
// tslint:disable no-console
Object.defineProperty(exports, "__esModule", { value: true });
const idx = require("idx-data");
const utilities_ts_1 = require("utilities-ts");
async function run() {
    const csvPath = process.argv[2];
    const idxPath = process.argv[3];
    console.log(`Converting <${csvPath}> to idx at <${idxPath}>`);
    const rows = 60000;
    const cols = 1;
    const buffer = new Uint8Array(rows * cols);
    await utilities_ts_1.csv.loadCsvToBuffer({
        buffer,
        path: csvPath,
    });
    const shape = [rows, cols];
    await idx.saveBits(buffer, shape, idxPath);
}
run().then(() => process.exit(0)).catch(console.log);
//# sourceMappingURL=csvToIdx.js.map