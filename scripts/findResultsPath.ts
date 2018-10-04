import { findResultsPath } from "../src/results";

// tslint:disable no-console

async function execute() {
    if (process.argv.length !== 5) {
        console.log('Please call again using: ');
        console.log('ts-node scripts/findResultsPath.ts {resultsBaseDir} {experimentFile} {index}');
        process.exit(0);
    }
    const run = parseInt(process.argv[4]);
    const experimentPath = process.argv[3];
    const rootPath = process.argv[2];

    const resultsPath = await findResultsPath(rootPath, experimentPath, run);
    console.log(resultsPath);
}

execute();
