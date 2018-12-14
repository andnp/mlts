"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// tslint:disable no-console
const idx = require("../src/data/utils/idx");
async function run() {
    const data = await idx.loadBits('cifar_labels.idx');
    console.log(data.shape, data.type, data.data[0]);
}
run().catch(console.log);
//# sourceMappingURL=test.js.map