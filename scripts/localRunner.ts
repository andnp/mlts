// tslint:disable no-console
import { parseCLI } from './runner/parseCLI';
import * as parallel from './runner/parallel';

const run = async () => {
    const exps = await parseCLI();
    await parallel.run(exps);
};

run().catch(console.log).then(() => process.exit(0));
