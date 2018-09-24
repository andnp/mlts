// tslint:disable no-console
import * as v from 'validtyped';
import * as path from 'path';
import * as tsplot from 'tsplot';
import * as files from '../src/utils/files';
import { discriminatedObject } from '../src/utils/objects';

const filterUndefined = <T>(x: Array<T | undefined>): T[] => x.filter(d => d !== undefined) as any;

const resultFileNames = [ 'originalH.txt', 'test.txt', 'train.txt' ];

async function execute() {
    if (process.argv.length !== 3) {
        console.log('Please call again using: ');
        console.log('npm run file scripts/collectResults.ts {resultsDir}');
        process.exit(0);
    }

    const rootPath = process.argv[2];
    const hashDirectories = (await files.readdir(rootPath)).map(n => path.join(rootPath, n));

    const uncollectedResults = await Promise.all(hashDirectories.filter(dir => files.fileExists(path.join(dir, 'results.json'))));

    await Promise.all(uncollectedResults.map(async (res) => {
        const descriptionsOrUndefined = await Promise.all(resultFileNames.map(async (resultFile) => {
            const resultFiles = await files.glob(path.join(res, '*', resultFile));
            if (resultFiles.length === 0) return;
            const contents = await Promise.all(resultFiles.map(file => files.readFile(file)));
            const results = contents.map(c => parseFloat(c.toString()));


            const resMatrix = tsplot.Matrix.fromData([results]);
            return {
                description: tsplot.describeRows(resMatrix)[0],
                name: resultFile,
            };
        }));

        const descriptions = filterUndefined(descriptionsOrUndefined);

        const paramsFiles = await files.glob(path.join(res, '*', 'params.json'));
        const experimentFiles = await files.glob(path.join(res, '*', 'experiment.json'));

        const params = await files.readJson(paramsFiles[0], v.any());
        const experiment = await files.readJson(experimentFiles[0], v.any());

        const description = discriminatedObject('name', descriptions);

        const result = {
            ...description,
            metaParameters: params,
            algorithm: experiment.algorithm,
            dataset: experiment.dataset,
            optimization: experiment.optimization,
        };

        await files.writeJson(path.join(res, 'results.json'), result);
    }));

}

execute();
