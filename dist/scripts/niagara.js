"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const slurmScheduler_1 = require("./runner/slurmScheduler");
const params = {
    // each node has 40 cpus and 80 threads.
    cpus: 40,
    // by specifying 1 node, we can remove a warning while batch submitting jobs
    nodes: 1,
    // each individual run will parallelize over 5 cores
    cpusPerTask: 5,
    // queue up tasks per (cpu / cpusPerTask)
    tasksPerCPU: 10,
    time: slurmScheduler_1.hours(3),
    gccVersion: '7.3.0',
};
slurmScheduler_1.schedule(params).then(() => process.exit(0));
//# sourceMappingURL=niagara.js.map