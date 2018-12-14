// tslint:disable no-console

import * as idx from '../src/data/utils/idx';
import { csv } from 'utilities-ts';

async function run() {
    const csvPath = process.argv[2];
    const idxPath = process.argv[3];

    console.log(`Converting <${csvPath}> to idx at <${idxPath}>`);

    // TODO: consider a way to not make this float32
    // this should be based on the type of the underlying data
    const original = await csv.load(csvPath);
    const shape = [original.rows, original.cols];

    await idx.saveBits(original.raw, shape, idxPath);
}

run().then(() => process.exit(0)).catch(console.log);
