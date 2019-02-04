// tslint:disable no-console
import * as v from 'validtyped';
import * as path from 'path';
import * as tsplot from 'tsplot';
import * as _ from 'lodash';
import { files, objects, arrays, Observable, Matrix } from 'utilities-ts';

import { OptimizationParameters } from '../optimization';

export type Result = {
    metaParameters: any;
    algorithm: string;
    dataset: string;
    path: string;
    hashPath: string;
    optimization: Partial<OptimizationParameters>
} & Record<string, any>;

export async function collectResults(rootPath: string, resultFileNames: string[]) {
    const hashDepth = await findHashDirectoryDepth(rootPath);
    const hashPath = path.join(rootPath, '/*'.repeat(hashDepth));

    const [ collectedResults, uncollectedResults ] = files
        .globObservable(hashPath)
        .partition(dir => files.fileExists(path.join(dir, 'results.json')));

    const newResultsObservable = uncollectedResults
        // to remain scalable to many results files, we must limit the number we process simultaneously
        // this slows down processing a little, but prevents out-of-memory errors
        .bottleneck(6)
        .map(async (hashDir) => {
            const descriptions = await Observable.fromArray(resultFileNames)
                .map(resultFile => describeResultFiles(hashDir, resultFile))
                .filterUndefined()
                .collect();

            const params = await files.globObservable(path.join(hashDir, '*', 'params.json'))
                .concat(files.globObservable(path.join(hashDir, 'params.json')))
                .take(1)
                .map(loc => files.readJson(loc, v.any()))
                .collect()
                .then(arrays.getFirst);

            const experiment = await files.globObservable(path.join(hashDir, '*', 'experiment.json'))
                .concat(files.globObservable(path.join(hashDir, 'experiment.json')))
                .take(1)
                .map(loc => files.readJson(loc, v.any()))
                .collect()
                .then(arrays.getFirst);

            const description = objects.discriminatedObject('name', descriptions);

            const resultPath = path.join(hashDir, 'results.json');
            const result: Result = {
                ...description,
                path: resultPath,
                hashPath: hashDir,
                metaParameters: params,
                algorithm: experiment.algorithm,
                dataset: experiment.dataset,
                optimization: experiment.optimization,
            };

            await files.writeJson(resultPath, result);

            return result;
        });

    const results = await collectedResults
        .map(hashDir => files.readJson(path.join(hashDir, 'results.json'), v.any()) as Promise<Result>)
        .concat(newResultsObservable)
        .collect();

    return results;
}

// finds the depth for the hash directories.
// non-trivial now that path can take arbitrary shape
async function findHashDirectoryDepth(root: string): Promise<number> {
    const helper = async (rootPath: string): Promise<number> => {
        const subDirs = await files.readdir(rootPath);
        if (subDirs.length === 0) return 0;
        const subDir = subDirs[0];

        if (isNumerical(subDir)) return 1;

        const depth = await helper(path.join(rootPath, subDir));
        return depth + 1;
    };

    // use a helper to find the "numerical" paths
    // these are the run numbers, and should come just after the hash path
    // subtract 1 from the run number depth to retrieve the hash depth
    const depth = await helper(root);
    return depth - 1;
}

const isNumerical = (x: string) => `${parseInt(x)}` === x;

async function describeResultFiles(resultFilePaths: string, resultFileName: string) {
    const results = await files.globObservable(path.join(resultFilePaths, '*', resultFileName))
        .map(file => files.readFile(file))
        .map(c => parseFloat(c.toString()))
        .collect();

    if (results.length === 0) return;

    // create an 1*n matrix so that we can use description utility methods
    const resMatrix = Matrix.fromData([results]);
    return {
        // describeRows will get mean/stderr over columns for each row
        // since we only have one row, grab only that description
        description: tsplot.describeRows(resMatrix)[0],
        name: resultFileName,
    };
}
