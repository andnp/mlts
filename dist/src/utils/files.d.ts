/// <reference types="node" />
import * as fs from 'fs';
import * as v from 'validtyped';
import * as rmrf from 'rimraf';
import * as globAsync from 'glob';
export declare const writeFile: (location: string, data: any) => Promise<void>;
export declare const readFile: typeof fs.readFile.__promisify__;
export declare const fileExists: typeof fs.exists.__promisify__;
export declare const readdir: typeof fs.readdir.__promisify__;
export declare const removeRecursively: typeof rmrf.__promisify__;
export declare const glob: typeof globAsync.__promisify__;
/**
 * Converts a string containing forward slashes ("/")
 * to a system specific file path. On Unix based systems
 * maintains the ("/") and on Windows systems uses ("\")
 */
export declare const filePath: (location: string) => string;
/**
 * Creates folders for the entire given path if necessary.
 * Same behaviour as mkdir -p
 */
export declare const createFolder: (location: string) => Promise<void>;
/**
 * Stringifies an object then writes it to the file location.
 * Creates the folder path if necessary first.
 */
export declare function writeJson(location: string, obj: object): Promise<void>;
/**
 * Reads a json file from a given path.
 * Validates that file's integrity against the given schema.
 */
export declare function readJson<T>(location: string, schema: v.Validator<T>): Promise<T>;
