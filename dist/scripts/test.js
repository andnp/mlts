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
require("@tensorflow/tfjs-node");
const src_1 = require("../src");
function execute() {
    return __awaiter(this, void 0, void 0, function* () {
        const d = yield src_1.Deterding.load();
        const alg = new src_1.ANN(d.description());
        const [X, Y] = d.train;
        yield alg.train(X, Y, { iterations: 100 });
        const [T, TY] = d.test;
        const Y_hat = yield alg.predict(X);
        const TY_hat = yield alg.predict(T);
        const testError = src_1.getClassificationError(TY_hat, TY);
        const trainError = src_1.getClassificationError(Y_hat, Y);
        console.log('train:', trainError.get(), 'test:', testError.get());
    });
}
execute().then(() => process.exit(0));
//# sourceMappingURL=test.js.map