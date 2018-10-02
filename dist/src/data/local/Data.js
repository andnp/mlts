"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tsUtil_1 = require("../../utils/tsUtil");
class Data {
    constructor(_x, _y, _t, _ty) {
        this._x = _x;
        this._y = _y;
        this._t = _t;
        this._ty = _ty;
    }
    get train() {
        return tsUtil_1.tuple(this._x, this._y);
    }
    get test() {
        return tsUtil_1.tuple(this._t, this._ty);
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
exports.Data = Data;
//# sourceMappingURL=Data.js.map