"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// tslint:disable no-console
const parseCLI_1 = require("./runner/parseCLI");
const parallel = require("./runner/parallel");
const run = async () => {
    const exps = await parseCLI_1.parseCLI();
    await parallel.run(exps, {
        parallel_jobs: 4,
    });
};
run().catch(console.log).then(() => process.exit(0));
//# sourceMappingURL=localRunner.js.map