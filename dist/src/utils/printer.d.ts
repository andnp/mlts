export interface Printable {
    toString(): string;
}
export declare type Printer = (data: Printable) => void;
export declare function printProgress<R>(f: (printer: Printer) => R): R;
export declare function printProgressAsync<R>(f: (printer: Printer) => Promise<R>): Promise<R>;
