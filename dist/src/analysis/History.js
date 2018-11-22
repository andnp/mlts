"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const results_1 = require("results");
const lossLens = results_1.lens('history.loss');
class History {
    constructor(name, params, loss) {
        this.name = name;
        this.params = params;
        this.loss = loss;
    }
    static fromTensorflowHistory(name, params, hist) {
        return History.fromTensorflowHistories(name, params, [hist]);
    }
    static fromTensorflowHistories(name, params, hists) {
        const rawHists = hists.map(hist => {
            const loss = lossLens(hist);
            if (typeof loss[0] !== 'number')
                throw new Error(`I don't know how to deal with tensor histories`);
            return { loss: loss };
        });
        const loss = rawHists.reduce((coll, hist) => coll.concat(hist.loss), []);
        return new History(name, params, loss);
    }
    static initializeEmpty(name, params) {
        return new History(name, params, []);
    }
}
exports.History = History;
//# sourceMappingURL=History.js.map