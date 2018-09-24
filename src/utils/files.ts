import * as fs from 'fs';
import * as mkdirp from 'mkdirp';
import * as path from 'path';
import * as v from 'validtyped';
import * as rmrf from 'rimraf';
import * as globAsync from 'glob';
import { promisify } from 'util';

// --------------------------
// Promisified File Utilities
// --------------------------
export const writeFile = (location: string, data: any) => createFolder(location).then(() => promisify(fs.writeFile)(location, data));
export const readFile = promisify(fs.readFile);
export const fileExists = promisify(fs.exists);
export const readdir = promisify(fs.readdir);
export const removeRecursively = promisify(rmrf);
export const glob = promisify(globAsync);

const mkdir = promisify(mkdirp);

/**
 * Converts a string containing forward slashes ("/")
 * to a system specific file path. On Unix based systems
 * maintains the ("/") and on Windows systems uses ("\")
 */
export const filePath = (location: string) => path.join(...location.split('/'));

/**
 * Creates folders for the entire given path if necessary.
 * Same behaviour as mkdir -p
 */
export const createFolder = (location: string) => mkdir(path.dirname(location));

/**
 * Stringifies an object then writes it to the file location.
 * Creates the folder path if necessary first.
 */
export function writeJson(location: string, obj: object) {
    return writeFile(location, JSON.stringify(obj, undefined, 2));
}

/**
 * Reads a json file from a given path.
 * Validates that file's integrity against the given schema.
 */
export async function readJson<T>(location: string, schema: v.Validator<T>): Promise<T> {
    const rawData = await readFile(location);
    const data = JSON.parse(rawData.toString());
    const validated = schema.validate(data);
    if (!validated.valid) throw new Error(`Expected data to match schema. <${JSON.stringify(validated.errors, undefined, 2)}>`);
    return validated.data;
}
