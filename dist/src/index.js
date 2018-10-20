"use strict";
// tslint:disable no-reference
/// <reference path="./types/inly.d.ts" />
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
require("./registry");
const commandLine_i = require("./utils/commandLine");
exports.commandLine = commandLine_i;
const printer_i = require("./utils/printer");
exports.printer = printer_i;
const random_i = require("./utils/random");
exports.random = random_i;
const tasks_i = require("./utils/tasks");
exports.tasks = tasks_i;
const tensorflow_i = require("./utils/tensorflow");
exports.tensorflow = tensorflow_i;
const results_i = require("./results");
exports.results = results_i;
__export(require("./transformations"));
__export(require("./regularizers"));
__export(require("./optimization"));
__export(require("./experiments"));
__export(require("./data"));
__export(require("./analysis"));
__export(require("./algorithms"));
var flatten_1 = require("./utils/flatten");
exports.flattenToArray = flatten_1.flattenToArray;
var matrix_1 = require("./utils/matrix");
exports.Matrix = matrix_1.Matrix;
//# sourceMappingURL=index.js.map