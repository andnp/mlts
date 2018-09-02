import * as csv from 'fast-csv';
import { RawMatrix, Matrix } from 'utils/matrix';

export function loadCsv(path: string): Promise<Matrix> {
    const rawData: RawMatrix = [];

    return new Promise<Matrix>((resolve, reject) => {
        csv.fromPath(path)
            .on('data', d => rawData.push(d))
            .on('end', () => resolve(new Matrix(rawData)))
            .on('error', reject);
    });
}
