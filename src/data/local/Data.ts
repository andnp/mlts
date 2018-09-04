import { Matrix } from 'utils/matrix';
import { tuple } from 'utils/tsUtil';


export interface Dataset<M> {
    train: [ M, M ];
    test: [ M, M ];
}

export class Data implements Dataset<Matrix> {
    constructor(
        protected _x: Matrix,
        protected _y: Matrix,
        protected _t: Matrix,
        protected _ty: Matrix,
    ) {}

    get train() {
        return tuple(this._x, this._y);
    }

    get test() {
        return tuple(this._t, this._ty);
    }
}
