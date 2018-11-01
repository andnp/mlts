// tslint:disable no-console
import * as v from 'validtyped';
import * as path from 'path';
import * as tsplot from 'tsplot';
import * as _ from 'lodash';
import { files, objects, promise, arrays } from 'utilities-ts';

import { Matrix } from '../utils/matrix';
import { OptimizationParameters } from '../optimization';

export type Result = {
    metaParameters: any;
    algorithm: string;
    dataset: string;
    optimization: Partial<OptimizationParameters>
} & Record<string, any>;

export async function collectResults(rootPath: string, resultFileNames: string[]) {
    const hashDirectories = (await files.readdir(rootPath)).map(n => path.join(rootPath, n));

    const uncollectedResults = await Promise.all(hashDirectories.filter(dir => files.fileExists(path.join(dir, 'results.json'))));

    const newResults = await promise.map(uncollectedResults, async (hashDir) => {
        const descriptionsOrUndefined = await promise.map(resultFileNames, resultFile => describeResultFiles(hashDir, resultFile));

        const descriptions = arrays.filterUndefined(descriptionsOrUndefined);

        const paramsFiles = await files.glob(path.join(hashDir, '*', 'params.json'));
        const experimentFiles = await files.glob(path.join(hashDir, '*', 'experiment.json'));

        const params = await files.readJson(paramsFiles[0], v.any());
        const experiment = await files.readJson(experimentFiles[0], v.any());

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
    const oldResults = await promise.map(oldResultsHashes, hashDir => files.readJson(path.join(hashDir, 'results.json'), v.any()));

    const results = newResults.concat(oldResults);

    return results;
}

async function describeResultFiles(resultFilePaths: string, resultFileName: string) {
    const resultFiles = await files.glob(path.join(resultFilePaths, '*', resultFileName));
    if (resultFiles.length === 0) return;

    const contents = await promise.map(resultFiles, file => files.readFile(file));
    const results = contents.map(c => parseFloat(c.toString()));

    // create an 1*n matrix so that we can use description utility methods
    const resMatrix = Matrix.fromData([results]);
    return {
        // describeRows will get mean/stderr over columns for each row
        // since we only have one row, grab only that description
        description: tsplot.describeRows(resMatrix)[0],
        name: resultFileName,
    };
}
