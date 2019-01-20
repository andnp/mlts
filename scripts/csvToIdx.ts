// tslint:disable no-console

import * as idx from 'idx-data';
import { csv } from 'utilities-ts';

async function run() {
    const csvPath = process.argv[2];
    const idxPath = process.argv[3];

    console.log(`Converting <${csvPath}> to idx at <${idxPath}>`);

    const rows = 60000;
    const cols = 1;
    const buffer = new Uint8Array(rows * cols);
    await csv.loadCsvToBuffer({
        buffer,
        path: csvPath,
    });

    const shape = [rows, cols];

    await idx.saveBits(buffer, shape, idxPath);
}

run().then(() => process.exit(0)).catch(console.log);
