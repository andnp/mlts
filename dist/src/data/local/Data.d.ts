import { Matrix } from '../../utils/matrix';
export interface Dataset<M> {
    train: [M, M];
    test: [M, M];
}
export declare class Data implements Dataset<Matrix> {
    protected _x: Matrix;
    protected _y: Matrix;
    protected _t: Matrix;
    protected _ty: Matrix;
    constructor(_x: Matrix, _y: Matrix, _t: Matrix, _ty: Matrix);
    readonly train: [Matrix, Matrix];
    readonly test: [Matrix, Matrix];
    readonly features: number;
    readonly trainSamples: number;
    readonly testSamples: number;
    readonly classes: number;
    description(): {
        samples: number;
        testSamples: number;
        features: number;
        classes: number;
    };
}
