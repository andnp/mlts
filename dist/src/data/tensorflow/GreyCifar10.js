"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TensorflowDataset_1 = require("../tensorflow/TensorflowDataset");
const mlts_experiment_data_1 = require("mlts-experiment-data");
class GreyCifar10 extends TensorflowDataset_1.TensorflowDataset {
    static async load(location) {
        const d = await mlts_experiment_data_1.GrayCifar10.load(location);
        return GreyCifar10.fromDataset(d);
    }
    static fromTensorflowDataset(d) {
        return new GreyCifar10(d.train[0], d.train[1], d.test[0], d.test[1]);
    }
    static fromDataset(d) {
        const data = GreyCifar10.fromTensorflowDataset(super.fromDataset(d));
        return data.scaleByConstant(255).oneHot(10);
    }
}
exports.GreyCifar10 = GreyCifar10;
//# sourceMappingURL=GreyCifar10.js.map