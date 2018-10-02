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
const TensorflowDataset_1 = require("../tensorflow/TensorflowDataset");
const cifar = require("../local/gray_cifar10");
class GreyCifar10 extends TensorflowDataset_1.TensorflowDataset {
    static load(location) {
        return __awaiter(this, void 0, void 0, function* () {
            const d = yield cifar.load(location);
            return GreyCifar10.fromDataset(d);
        });
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