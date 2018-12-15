"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Data {
    constructor(_x, _y, _t, _ty) {
        this._x = _x;
        this._y = _y;
        this._t = _t;
        this._ty = _ty;
    }
    get train() {
        return [this._x, this._y];
    }
    get test() {
        return [this._t, this._ty];
    }
}
exports.Data = Data;
//# sourceMappingURL=Data.js.map