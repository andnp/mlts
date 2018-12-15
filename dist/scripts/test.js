"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// tslint:disable no-console
const idx = require("../src/data/utils/idx");
async function run() {
    const data = await idx.loadBits('deterding_data.idx');
    console.log(data);
}
run().catch(console.log);
//# sourceMappingURL=test.js.map