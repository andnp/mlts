"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const slurmScheduler_1 = require("./runner/slurmScheduler");
const params = {
    cpus: 4,
    tasksPerCPU: 2,
    memoryPerCPU: slurmScheduler_1.gigs(2),
    time: slurmScheduler_1.hours(6),
    gccVersion: '4.9.4',
};
slurmScheduler_1.schedule(params).then(() => process.exit(0));
//# sourceMappingURL=cedar.js.map