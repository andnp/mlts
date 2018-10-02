"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class History {
    constructor(name, params, loss) {
        this.name = name;
        this.params = params;
        this.loss = loss;
    }
    static fromTensorflowHistory(name, params, hist) {
        if (typeof hist.history.loss[0] !== 'number')
            throw new Error(`I don't know how to deal with tensor histories`);
        return new History(name, params, hist.history.loss);
    }
    static initializeEmpty(name, params) {
        return new History(name, params, []);
    }
}
exports.History = History;
//# sourceMappingURL=History.js.map