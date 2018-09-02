export type RawMatrix = number[][];

export class Matrix {
    private data: RawMatrix;
    private r: number;
    private c: number;

    constructor(data: RawMatrix) {
        this.c = data[0].length;
        this.r = data.length;

        data.forEach(row => {
            if (row.length !== this.c) throw new Error(`Expected matrix to be rectangular: expected <${this.c}>, got <${row.length}>`);
        });

        this.data = data;
    }

    static fromArray(rows: number, cols: number, data: number[] | Float32Array | Int32Array | Uint8Array) {
        const raw: RawMatrix = [];
        for (let i = 0; i < rows; ++i) {
            const row: number[] = [];
            for (let j = 0; j < cols; ++j) {
                row.push(data[i * cols + j]);
            }
            raw.push(row);
        }
        return new Matrix(raw);
    }

    get raw(): RawMatrix {
        return this.data;
    }

    get rows() { return this.r; }
    get cols() { return this.c; }
}
