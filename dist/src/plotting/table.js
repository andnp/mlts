"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const utilities_ts_1 = require("utilities-ts");
function buildMarkdownTable(o) {
    return buildTable({
        ...o,
        columnHeaderSeparator: ':---:',
        columnJoiner: ' | ',
        rowHeaderSeparator: ' | ',
        space: false,
        newLine: '\n',
    });
}
exports.buildMarkdownTable = buildMarkdownTable;
function buildConsoleTable(o) {
    return buildTable({
        ...o,
        rowHeaderSeparator: ': ',
        columnHeaderSeparator: '',
        columnJoiner: '',
        newLine: '\n',
        space: true,
    });
}
exports.buildConsoleTable = buildConsoleTable;
function buildTable(o) {
    let table = '';
    const rowHeaderLength = maxLength(o.rowHeaders) + 2;
    const columnLength = maxLength(o.columnHeaders) + 1;
    const noPad = (str, num) => str;
    const _rightPad = o.space ? rightPad : noPad;
    const _leftPad = o.space ? leftPad : noPad;
    const numColumns = o.columnHeaders.length;
    const header = o.columnHeaders.map(a => _rightPad(a, columnLength + o.columnJoiner.length)).join(o.columnJoiner);
    const separator = _.times(numColumns + 1, () => o.columnHeaderSeparator).join(o.columnJoiner);
    const padding = _leftPad('', rowHeaderLength + o.rowHeaderSeparator.length);
    const headerSeparator = separator.length > 0 ? separator + o.newLine : separator;
    table += padding + o.columnJoiner + header + o.newLine + headerSeparator;
    o.rowHeaders.forEach((row, d) => {
        const rowHeader = `${_rightPad(row, rowHeaderLength)}` + o.rowHeaderSeparator;
        table += rowHeader;
        o.columnHeaders.forEach((col, a) => {
            const entry = o.data[d][a];
            table += _rightPad(`${entry}`, columnLength);
            if (a + 1 !== numColumns) {
                table += o.columnJoiner;
            }
        });
        table += o.newLine;
    });
    return table;
}
exports.buildTable = buildTable;
const maxReducer = (a, b) => a > b ? a : b;
const maxLength = (arr) => {
    return arr.map(utilities_ts_1.fp.prop('length')).reduce(maxReducer);
};
const rightPad = (str, len) => {
    if (str.length >= len)
        return str;
    return str + ' '.repeat(len - str.length);
};
const leftPad = (str, len) => {
    if (str.length >= len)
        return str;
    return ' '.repeat(len - str.length) + str;
};
//# sourceMappingURL=table.js.map