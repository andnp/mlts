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
export declare function buildMarkdownTable(o: BaseTableParams): string;
export declare function buildConsoleTable(o: BaseTableParams): string;
export declare function buildTable(o: TableParams): string;
