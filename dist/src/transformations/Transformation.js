"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const TensorflowDataset_1 = require("../data/tensorflow/TensorflowDataset");
class Transformation {
    applyTransformation(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const [X, Y] = data.train;
            const [T, TY] = data.test;
            const transformed_X = yield this.transformTensor(X);
            const transformed_T = yield this.transformTensor(T);
            return new TensorflowDataset_1.TensorflowDataset(transformed_X, Y, transformed_T, TY);
        });
    }
}
exports.Transformation = Transformation;
//# sourceMappingURL=Transformation.js.map