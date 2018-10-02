// tslint:disable no-reference
/// <reference path="./types/inly.d.ts" />

import './registry';

import * as arrays_i from './utils/arrays';
export const arrays = arrays_i;
import * as buffers_i from './utils/buffers';
export const buffers = buffers_i;
import * as commandLine_i from './utils/commandLine';
export const commandLine = commandLine_i;
import * as csv_i from './utils/csv';
export const csv = csv_i;
import * as dates_i from './utils/dates';
export const dates = dates_i;
import * as files_i from './utils/files';
export const files = files_i;
import * as fp_i from './utils/fp';
export const fp = fp_i;
import * as objects_i from './utils/objects';
export const objects = objects_i;
import * as printer_i from './utils/printer';
export const printer = printer_i;
import * as promise_i from './utils/promise';
export const promise = promise_i;
import * as random_i from './utils/random';
export const random = random_i;
import * as tasks_i from './utils/tasks';
export const tasks = tasks_i;
import * as tensorflow_i from './utils/tensorflow';
export const tensorflow = tensorflow_i;
import * as time_i from './utils/time';
export const time = time_i;
import * as tsUtils_i from './utils/tsUtil';
export const tsUtils = tsUtils_i;

export * from './transformations';
export * from './regularizers';
export * from './optimization';
export * from './experiments';
export * from './data';
export * from './analysis';
export * from './algorithms';

export { Matrix } from './utils/matrix';
