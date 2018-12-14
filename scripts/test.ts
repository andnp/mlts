// tslint:disable no-console
import * as idx from '../src/data/utils/idx';

async function run() {
    const data = await idx.loadBits('deterding_data.idx');

    console.log(data);
}

run().catch(console.log);
