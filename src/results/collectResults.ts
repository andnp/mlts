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
    optimization: Partial<OptimizationParameters>
} & Record<string, any>;

export async function collectResults(rootPath: string, resultFileNames: string[]) {
    const hashDirectories = await Observable.fromArray(await files.readdir(rootPath))
        .map(n => path.join(rootPath, n))
        .collect();

    const uncollectedResults = await Observable.fromArray(hashDirectories)
        .filter(dir => files.fileExists(path.join(dir, 'results.json')).then(b => !b))
        .collect();

    const newResultsObservable = Observable.fromArray(uncollectedResults)
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
                metaParameters: params,
                algorithm: experiment.algorithm,
                dataset: experiment.dataset,
                optimization: experiment.optimization,
            };

            await files.writeJson(resultPath, result);

            return result;
        });

    const oldResultsHashes = _.difference(hashDirectories, uncollectedResults);

    const results = await Observable.fromArray(oldResultsHashes)
        .map(hashDir => files.readJson(path.join(hashDir, 'results.json'), v.any()) as Promise<Result>)
        .concat(newResultsObservable)
        .collect();

    return results;
}

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
