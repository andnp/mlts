"use strict";
// tslint:disable no-console
/*
Tensorflow used to have a memory leak whenever fitting a model.
At the end of every epoch, one tensor would be leaked with 4 bytes.
This caused the graph to grow extremely large while training certain models,
and caused a dramatic speed decrease over time.

It appears to be fixed now, but I'm leaving this script so that it is easy
to test for the same (or similar) leaks in the future.
*/
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const tf = require("@tensorflow/tfjs");
require("@tensorflow/tfjs-node");
const Deterding_1 = require("../src/data/tensorflow/Deterding");
class LeakDetection extends tf.Callback {
    onEpochEnd() {
        return __awaiter(this, void 0, void 0, function* () {
            const m = tf.memory();
            console.log(m);
        });
    }
}
const execute = () => __awaiter(this, void 0, void 0, function* () {
    const data = yield Deterding_1.Deterding.load();
    const [X, Y] = data.train;
    const { features, classes, } = data.description();
    const inputs = tf.layers.input({ shape: [features] });
    const h = tf.layers.dense({ units: 10, activation: 'relu' }).apply(inputs);
    const outputs = tf.layers.dense({ units: classes, activation: 'sigmoid' }).apply(h);
    const model = tf.model({ inputs, outputs });
    model.compile({
        loss: 'binaryCrossentropy',
        optimizer: 'rmsprop',
    });
    yield model.fit(X, Y, {
        epochs: 100,
        callbacks: [new LeakDetection()],
    });
});
console.log('here');
execute().catch(console.log).then(() => process.exit(0));
//# sourceMappingURL=memoryLeak.js.map