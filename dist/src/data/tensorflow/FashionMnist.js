"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TensorflowDataset_1 = require("../tensorflow/TensorflowDataset");
const mlts_experiment_data_1 = require("mlts-experiment-data");
class FashionMnist extends TensorflowDataset_1.TensorflowDataset {
    static async load(location) {
        const d = await mlts_experiment_data_1.FashionMnist.load(location);
        return FashionMnist.fromDataset(d);
    }
    static fromTensorflowDataset(d) {
        return new FashionMnist(d.train[0], d.train[1], d.test[0], d.test[1]);
    }
    static fromDataset(d) {
        const data = FashionMnist.fromTensorflowDataset(super.fromDataset(d));
        return data.scaleByConstant(255).oneHot(10);
    }
}
exports.FashionMnist = FashionMnist;
//# sourceMappingURL=FashionMnist.js.map