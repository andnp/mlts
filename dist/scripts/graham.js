"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const slurmScheduler_1 = require("./runner/slurmScheduler");
const params = {
    cpus: 8,
    tasksPerCPU: 2,
    memoryPerCPU: slurmScheduler_1.gigs(2),
    time: slurmScheduler_1.hours(3),
    gccVersion: '4.8.5',
};
slurmScheduler_1.schedule(params).then(() => process.exit(0));
//# sourceMappingURL=graham.js.map