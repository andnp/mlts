// tslint:disable no-console
import { results } from '../src';

const resultFileNames = [ 'originalH.txt', 'test.txt', 'train.txt' ];

async function execute() {
    if (process.argv.length !== 3) {
        console.log('Please call again using: ');
        console.log('npm run file scripts/collectResults.ts {resultsDir}');
        process.exit(0);
    }

    const rootPath = process.argv[2];

    await results.collectResults(rootPath, resultFileNames);
}

execute();
