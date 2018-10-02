"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const mkdirp = require("mkdirp");
const path = require("path");
const rmrf = require("rimraf");
const globAsync = require("glob");
const util_1 = require("util");
// --------------------------
// Promisified File Utilities
// --------------------------
exports.writeFile = (location, data) => exports.createFolder(location).then(() => util_1.promisify(fs.writeFile)(location, data));
exports.readFile = util_1.promisify(fs.readFile);
exports.fileExists = util_1.promisify(fs.exists);
exports.readdir = util_1.promisify(fs.readdir);
exports.removeRecursively = util_1.promisify(rmrf);
exports.glob = util_1.promisify(globAsync);
const mkdir = util_1.promisify(mkdirp);
/**
 * Converts a string containing forward slashes ("/")
 * to a system specific file path. On Unix based systems
 * maintains the ("/") and on Windows systems uses ("\")
 */
exports.filePath = (location) => path.join(...location.split('/'));
/**
 * Creates folders for the entire given path if necessary.
 * Same behaviour as mkdir -p
 */
exports.createFolder = (location) => mkdir(path.dirname(location));
/**
 * Stringifies an object then writes it to the file location.
 * Creates the folder path if necessary first.
 */
function writeJson(location, obj) {
    return exports.writeFile(location, JSON.stringify(obj, undefined, 2));
}
exports.writeJson = writeJson;
/**
 * Reads a json file from a given path.
 * Validates that file's integrity against the given schema.
 */
function readJson(location, schema) {
    return __awaiter(this, void 0, void 0, function* () {
        const rawData = yield exports.readFile(location);
        const data = JSON.parse(rawData.toString());
        const validated = schema.validate(data);
        if (!validated.valid)
            throw new Error(`Expected data to match schema. <${JSON.stringify(validated.errors, undefined, 2)}>`);
        return validated.data;
    });
}
exports.readJson = readJson;
//# sourceMappingURL=files.js.map