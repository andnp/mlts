// tslint:disable no-console
import * as globAsync from 'glob';
import * as fs from 'fs';
import * as path from 'path';
import * as util from 'util';

const glob = util.promisify(globAsync);
const readdir = util.promisify(fs.readdir);
const exists = util.promisify(fs.exists);
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

async function execute() {
    if (process.argv.length !== 3) {
        console.log('Please call again using: ');
        console.log('npm run file scripts/collectResults.ts {resultsDir}');
        process.exit(0);
    }

    const rootPath = process.argv[2];
    const hashDirectories = (await readdir(rootPath)).map(n => path.join(rootPath, n));

    const uncollectedResults = await Promise.all(hashDirectories.filter(dir => exists(path.join(dir, 'results.csv'))));

    await Promise.all(uncollectedResults.map(async (res) => {
        const resultFiles = await glob(path.join(res, '*', 'result.txt'));

        const contents = await Promise.all(resultFiles.map(file => readFile(file)));

        const csv = contents.map(c => c.toString()).join('\n');

        await writeFile(path.join(res, 'results.csv'), csv);
    }));

}

execute();
