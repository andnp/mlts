import { ScheduleParams, gigs, hours, schedule } from './runner/slurmScheduler';

const params: ScheduleParams = {
    cpus: 4,
    tasksPerCPU: 2,
    memoryPerCPU: gigs(2),
    time: hours(6),

    gccVersion: '4.9.4',
};

schedule(params).then(() => process.exit(0));
