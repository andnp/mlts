import { ScheduleParams, hours, schedule } from './runner/slurmScheduler';

const params: ScheduleParams = {
    // each node has 40 cpus and 80 threads.
    cpus: 40,
    // by specifying 1 node, we can remove a warning while batch submitting jobs
    nodes: 1,
    // each individual run will parallelize over 5 cores
    cpusPerTask: 5,
    // queue up tasks per (cpu / cpusPerTask)
    tasksPerCPU: 10,
    time: hours(3),

    gccVersion: '7.3.0',
};

schedule(params).then(() => process.exit(0));
