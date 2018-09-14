import * as fs from 'fs';
import * as mkdirp from 'mkdirp';
import * as path from 'path';
import * as v from 'validtyped';
import * as rmrf from 'rimraf';
import { promisify } from 'util';

export const writeFile = (location: string, data: string) => createFolder(location).then(() => promisify(fs.writeFile)(location, data));
export const readFile = promisify(fs.readFile);
export const fileExists = promisify(fs.exists);
export const readdir = promisify(fs.readdir);
export const removeRecursively = promisify(rmrf);

const mkdir = promisify(mkdirp);

export const createFolder = (location: string) => mkdir(path.dirname(location));

export function writeJson(location: string, obj: object) {
    return writeFile(location, JSON.stringify(obj, undefined, 2));
}

export async function readJson<T>(location: string, schema: v.Validator<T>): Promise<T> {
    const rawData = await readFile(location);
    const data = JSON.parse(rawData.toString());
    const validated = schema.validate(data);
    if (!validated.valid) throw new Error(`Expected data to match schema. <${JSON.stringify(validated.errors, undefined, 2)}>`);
    return validated.data;
}
