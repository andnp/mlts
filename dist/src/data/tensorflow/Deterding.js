"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TensorflowDataset_1 = require("../tensorflow/TensorflowDataset");
const mlts_experiment_data_1 = require("mlts-experiment-data");
class Deterding extends TensorflowDataset_1.TensorflowDataset {
    static async load(location) {
        const d = await mlts_experiment_data_1.Deterding.load(location);
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