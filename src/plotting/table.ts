import * as _ from 'lodash';
import { fp } from 'utilities-ts';

export interface BaseTableParams {
    data: Array<Array<string | number>>;
    rowHeaders: string[];
    columnHeaders: string[];
}

export interface TableParams extends BaseTableParams {
    rowHeaderSeparator: string;
    columnHeaderSeparator: string;
    columnJoiner: string;
    newLine: string;
    space: boolean;
}

export function buildMarkdownTable(o: BaseTableParams) {
    return buildTable({
        ...o,
        columnHeaderSeparator: ':---:',
        columnJoiner: ' | ',
        rowHeaderSeparator: ' | ',
        space: false,
        newLine: '\n',
    });
}

export function buildConsoleTable(o: BaseTableParams) {
    return buildTable({
        ...o,
        rowHeaderSeparator: ': ',
        columnHeaderSeparator: '',
        columnJoiner: '',
        newLine: '\n',
        space: true,
    });
}

export function buildTable(o: TableParams) {
    let table = '';

    const rowHeaderLength = maxLength(o.rowHeaders) + 2;
    const columnLength = maxLength(o.columnHeaders) + 1;

    const noPad = (str: string, num: number) => str;
    const _rightPad: typeof rightPad = o.space ? rightPad : noPad as any;
    const _leftPad: typeof leftPad   = o.space ? leftPad  : noPad as any;

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

const maxReducer = (a: number, b: number) => a > b ? a : b;
const maxLength = (arr: Array<{ length: number}>): number => {
    return arr.map(fp.prop('length')).reduce(maxReducer);
};

const rightPad = (str: string, len: number) => {
    if (str.length >= len) return str;
    return str + ' '.repeat(len - str.length);
};

const leftPad = (str: string, len: number) => {
    if (str.length >= len) return str;
    return ' '.repeat(len - str.length) + str;
};
