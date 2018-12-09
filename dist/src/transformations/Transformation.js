"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TensorflowDataset_1 = require("../data/tensorflow/TensorflowDataset");
class Transformation {
    async applyTransformation(data) {
        const [X, Y] = data.train;
        const [T, TY] = data.test;
        const transformed_X = await this.transformTensor(X);
        const transformed_T = await this.transformTensor(T);
        return new TensorflowDataset_1.TensorflowDataset(transformed_X, Y, transformed_T, TY);
    }
}
exports.Transformation = Transformation;
//# sourceMappingURL=Transformation.js.map