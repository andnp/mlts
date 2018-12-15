/// <reference path="../../src/types/inly.d.ts" />
import './registry';
import * as commandLine_i from './utils/commandLine';
export declare const commandLine: typeof commandLine_i;
import * as printer_i from './utils/printer';
export declare const printer: typeof printer_i;
import * as random_i from './utils/random';
export declare const random: typeof random_i;
import * as tasks_i from './utils/tasks';
export declare const tasks: typeof tasks_i;
import * as tensorflow_i from './utils/tensorflow';
export declare const tensorflow: typeof tensorflow_i;
import * as results_i from './results';
export declare const results: typeof results_i;
export * from './transformations';
export * from './regularizers';
export * from './optimization';
export * from './experiments';
export * from './data';
export * from './analysis';
export * from './algorithms';
export * from './plotting';
export { flattenToArray } from './utils/flatten';
export { Matrix } from './utils/matrix';
