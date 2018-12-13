import { ScheduleParams, gigs, hours, schedule } from './runner/slurmScheduler';

const params: ScheduleParams = {
    cpus: 8,
    tasksPerCPU: 2,
    memoryPerCPU: gigs(2),
    time: hours(3),

    gccVersion: '4.8.5',
};

schedule(params).then(() => process.exit(0));

