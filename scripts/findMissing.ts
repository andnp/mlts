import { commandLine, results } from "../src";

// tslint:disable no-console

const runs = 20;

const base_path = 'results/imageFilters';

async function execute() {
    const { e: expPath } = commandLine.parseArgs();
    if (!expPath) throw new Error("Expected to be called with -e parameter");

    const incomplete = await results.findMissing(base_path, expPath, runs);
    console.log(incomplete);
}

execute().then(() => process.exit());
