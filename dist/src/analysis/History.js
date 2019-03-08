"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const fp_1 = require("../utils/fp");
const historyLens = fp_1.lens('history');
const lossLens = (name) => _.flow(historyLens, fp_1.lens(name));
class History {
    constructor(name, params, loss, other) {
        this.name = name;
        this.params = params;
        this.loss = loss;
        this.other = other || {};
    }
    static fromTensorflowHistory(name, params, hist, collect) {
        return History.fromTensorflowHistories(name, params, [hist], collect);
    }
    static fromTensorflowHistories(name, params, hists, collect) {
        const collectValues = (name) => {
            const rawHists = hists.map(hist => {
                const loss = lossLens(name)(hist);
                if (typeof loss[0] !== 'number')
                    throw new Error(`I don't know how to deal with tensor histories`);
                return { loss: loss };
            });
            const loss = rawHists.reduce((coll, hist) => coll.concat(hist.loss), []);
            return loss;
        };
        const loss = collectValues('loss');
        if (!collect)
            return new History(name, params, loss);
        const other = collect.reduce((coll, name) => {
            return {
                [name]: collectValues(name),
                ...coll,
            };
        }, {});
        return new History(name, params, loss, other);
    }
    static initializeEmpty(name, params) {
        return new History(name, params, []);
    }
}
exports.History = History;
//# sourceMappingURL=History.js.map