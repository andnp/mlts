"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("@tensorflow/tfjs-node");
const src_1 = require("../src");
async function execute() {
    const d = await src_1.Deterding.load();
    // const alg = new ANN(d.description());
    const alg = await src_1.ANN.fromSavedState('savedModels');
    const [X, Y] = d.train;
    await alg.train(X, Y, { iterations: 100 });
    const [T, TY] = d.test;
    const Y_hat = await alg.predict(X);
    const TY_hat = await alg.predict(T);
    const testError = src_1.getClassificationError(TY_hat, TY);
    const trainError = src_1.getClassificationError(Y_hat, Y);
    console.log('train:', trainError.get(), 'test:', testError.get());
}
execute().then(() => process.exit(0));
//# sourceMappingURL=test.js.map