// tslint:disable no-console
import * as _ from 'lodash';
import * as v from 'validtyped';
import { getNumberOfRuns } from '../../src';
import { files } from 'utilities-ts';

export interface ExperimentMetadata {
    executable: string;
    experimentPath: string;
    number_runs: number;
    repeats: number;
    basePath: string;
}

export const parseCLI = async () => {
    // get experiment file paths from command-line
    const [, , executable, basePath, runs, ...experiments] = process.argv;
    if (experiments.length === 0) {
        console.log('Please call again with:');
        console.log('ts-node runner.ts [dist/src/executable.js] [path/to/results] [runs] [path/to/experiment1.json] [path/to/experiment2.json] [...]');
        process.exit(0);
    }

    const exps = [] as ExperimentMetadata[];

    for (const expPath of experiments) {
        const exp = await files.readJson(expPath, v.any());
        const paramCount = getNumberOfRuns(exp.metaParameters);

        exps.push({
            executable,
            experimentPath: expPath,
            number_runs: parseInt(runs) * paramCount,
            repeats: parseInt(runs),
            basePath,
        });
    }

    return exps;
};
