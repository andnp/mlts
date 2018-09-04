import { Matrix } from 'utils/matrix';

export class Data {
    constructor(
        protected _x: Matrix,
        protected _y: Matrix,
        protected _t: Matrix,
        protected _ty: Matrix,
    ) {}

    get train() {
        return [ this._x, this._y ];
    }

    get test() {
        return [ this._t, this._ty ];
    }
}
