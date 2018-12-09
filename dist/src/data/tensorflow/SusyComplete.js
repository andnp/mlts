"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TensorflowDataset_1 = require("../tensorflow/TensorflowDataset");
const susy = require("../local/susy_complete");
class SusyComplete extends TensorflowDataset_1.TensorflowDataset {
    static async load(location) {
        const d = await susy.load(location);
        return SusyComplete.fromDataset(d);
    }
    static fromTensorflowDataset(d) {
        return new SusyComplete(d.train[0], d.train[1], d.test[0], d.test[1]);
    }
    static fromDataset(d) {
        const data = SusyComplete.fromTensorflowDataset(super.fromDataset(d));
        return data.scaleColumns().oneHot(2);
    }
}
exports.SusyComplete = SusyComplete;
//# sourceMappingURL=SusyComplete.js.map