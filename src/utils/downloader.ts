import axios from 'axios';
import * as inly from 'inly';
import * as path from 'path';
import * as fs from 'fs';
import * as mkdirp from 'mkdirp';
import { promisify } from 'util';

import { printProgressAsync } from './printer';

const mkdir = promisify(mkdirp);
const fileExists = promisify(fs.exists);

export async function download(url: string, folder: string) {
    const file = path.basename(url);
    const downloadDest = path.join(folder, file);

    const exists = await fileExists(downloadDest);
    if (exists) return;

    return printProgressAsync(async (printer) => {
        printer(`creating file path: ${folder}`);
        await mkdir(folder);

        printer(`retrieving ${url}`);
        const res = await axios.get(url, { responseType: 'stream' });

        const stream = res.data.pipe(fs.createWriteStream(downloadDest));

        await new Promise((resolve, reject) => {
            stream.on('finish', resolve);
            stream.on('error', reject);
        });

        printer(`unzipping: 0%`);
        await new Promise<void>((resolve, reject) => {
            const decoder = inly(downloadDest, folder);
            decoder.on('progress', (p: number) => printer(`unzipping: ${p}%`));
            decoder.on('end', resolve);
            decoder.on('error', reject);
        });
    });
}
