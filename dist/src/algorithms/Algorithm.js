"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const History_1 = require("../analysis/History");
const flatten_1 = require("../utils/flatten");
class Algorithm {
    constructor(datasetDescription) {
        this.datasetDescription = datasetDescription;
        this.opts = {};
    }
    async predict(T, opts) {
        return this._predict(T, opts);
    }
    // ----------
    // Parameters
    // ----------
    getParameters() {
        return flatten_1.flatten(this.opts);
    }
}
exports.Algorithm = Algorithm;
class SupervisedAlgorithm extends Algorithm {
    constructor(datasetDescription) {
        super(datasetDescription);
        this.datasetDescription = datasetDescription;
    }
    async train(X, Y, opts, track) {
        const history = await this._train(X, Y, opts, track);
        if (history instanceof History_1.History)
            return history;
        return History_1.History.fromTensorflowHistory(this.name, this.opts, history);
    }
}
exports.SupervisedAlgorithm = SupervisedAlgorithm;
class UnsupervisedAlgorithm extends Algorithm {
    async train(X, opts) {
        const history = await this._train(X, opts);
        if (history instanceof History_1.History)
            return history;
        return History_1.History.fromTensorflowHistory(this.name, this.opts, history);
    }
}
exports.UnsupervisedAlgorithm = UnsupervisedAlgorithm;
//# sourceMappingURL=Algorithm.js.map