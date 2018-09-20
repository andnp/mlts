// tslint:disable no-console
import * as globAsync from 'glob';
import * as fs from 'fs';
import * as path from 'path';
import * as util from 'util';
import * as tsplot from 'tsplot';
import { discriminatedObject } from '../src/utils/objects';

const filterUndefined = <T>(x: Array<T | undefined>): T[] => x.filter(d => d !== undefined) as any;

const glob = util.promisify(globAsync);
const readdir = util.promisify(fs.readdir);
const exists = util.promisify(fs.exists);
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

const resultFileNames = [ 'originalH.txt', 'test.txt', 'train.txt' ];

async function execute() {
    if (process.argv.length !== 3) {
        console.log('Please call again using: ');
        console.log('npm run file scripts/collectResults.ts {resultsDir}');
        process.exit(0);
    }

    const rootPath = process.argv[2];
    const hashDirectories = (await readdir(rootPath)).map(n => path.join(rootPath, n));

    const uncollectedResults = await Promise.all(hashDirectories.filter(dir => exists(path.join(dir, 'results.json'))));

    await Promise.all(uncollectedResults.map(async (res) => {
        const descriptionsOrUndefined = await Promise.all(resultFileNames.map(async (resultFile) => {
            const resultFiles = await glob(path.join(res, '*', resultFile));
            if (resultFiles.length === 0) return;
            const contents = await Promise.all(resultFiles.map(file => readFile(file)));
            const results = contents.map(c => parseFloat(c.toString()));


            const resMatrix = tsplot.Matrix.fromData([results]);
            return {
                description: tsplot.describeRows(resMatrix)[0],
                name: resultFile,
            };
        }));

        const descriptions = filterUndefined(descriptionsOrUndefined);

        const paramsFiles = await glob(path.join(res, '*', 'params.json'));
        const experimentFiles = await glob(path.join(res, '*', 'experiment.json'));

        const paramsFile = await readFile(paramsFiles[0]);
        const experimentFile = await readFile(experimentFiles[0]);

        const experiment = JSON.parse(experimentFile.toString());

        const description = discriminatedObject('name', descriptions);

        const result = {
            ...description,
            metaParameters: JSON.parse(paramsFile.toString()),
            algorithm: experiment.algorithm,
            dataset: experiment.dataset,
            optimization: experiment.optimization,
        };

        await writeFile(path.join(res, 'results.json'), JSON.stringify(result, undefined, 4));
    }));

}

execute();
