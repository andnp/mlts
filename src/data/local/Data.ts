import { Matrix } from '../../utils/matrix';
import { tuple } from '../../utils/tsUtil';


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

    get features() {
        return this._x.cols;
    }

    get trainSamples() {
        return this._x.rows;
    }

    get testSamples() {
        return this._t.rows;
    }

    get classes() {
        return this._y.cols;
    }

    description() {
        return {
            samples: this.trainSamples,
            testSamples: this.testSamples,
            features: this.features,
            classes: this.classes,
        };
    }
}
