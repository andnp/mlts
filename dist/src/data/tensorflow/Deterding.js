"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TensorflowDataset_1 = require("../tensorflow/TensorflowDataset");
const deterding = require("../local/deterding");
class Deterding extends TensorflowDataset_1.TensorflowDataset {
    static async load(location) {
        const d = await deterding.load(location);
        return Deterding.fromDataset(d);
    }
    static fromTensorflowDataset(d) {
        return new Deterding(d.train[0], d.train[1], d.test[0], d.test[1]);
    }
    static fromDataset(d) {
        return Deterding.fromTensorflowDataset(super.fromDataset(d));
    }
}
exports.Deterding = Deterding;
//# sourceMappingURL=Deterding.js.map