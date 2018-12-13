// tslint:disable no-console
import * as _ from 'lodash';
import { files } from 'utilities-ts';
import { results } from '../../src';
import { execSync } from 'child_process';
import { parseCLI } from './parseCLI';

export const gigs = (m: number) => `${m}G`;
export const hours = (h: number) => `${h - 1}:59:00`;

export interface ScheduleParams {
    cpus: number;
    tasksPerCPU: number;
    time: string;
    gccVersion: string;

    nodes?: number;
    cpusPerTask?: number;
    memoryPerCPU?: string;
}

const buildSlurm = (
    cpus: number,
    gcc_version: string,
    base_path: string,
    results_path: string,
    executable: string,
    expPath: string,
    run_str: string,
) => `#!/bin/bash
module load gcc/${gcc_version}

cd ${base_path}
parallel -j${cpus} --delay 1 srun -N1 -n1 npm run exec -- ${executable} -e ${expPath} -r ${results_path} -s $SCRATCH/savedModels -i ::: ${run_str}
`;

export const schedule = async (o: ScheduleParams) => {
    const exps = await parseCLI();
    const base = process.cwd();

    const sbatch_args = [
        // use martha's resource allocation account
        '--account=def-whitem',
        // run job for specified amount of time
        `--time=${o.time}`,
        // use specific number of nodes if specified, otherwise use as many nodes as the scheduler prefers
        // not specifying a number of nodes will decrease job queue time
        o.nodes ? `--nodes=${o.nodes}` : '',
        // if number of nodes specified, need to set the tasks per node
        // otherwise, just specify a number of tasks to be split across all nodes
        o.nodes
            ? `--ntasks-per-node=${o.cpus}`
            : `--ntasks=${o.cpus}`,
        // if this cluster requires specifying memory (mp2), then give memory requirements
        // certain clusters will warn if you specify memory, as they automatically give all memory on the node (niagara)
        o.memoryPerCPU ? `--mem-per-cpu=${o.memoryPerCPU}` : '',
        // always dump the output into scratch.
        // this reduces clutter and noise in the working directory
        `--output=$SCRATCH/job_output_%j.txt`,
    ].join(' ');

    const parallelJobs = o.cpusPerTask ? Math.floor(o.cpus / o.cpusPerTask) : o.cpus;

    for (const exp of exps) {
        const each = parallelJobs * o.tasksPerCPU;

        await results.findMissing(exp.basePath, exp.experimentPath, exp.repeats)
            .group(each)
            // this needs to happen synchronously
            .bottleneck(1)
            .map(async (job) => {
                if (job.length === 0) return;

                const job_string = job.join(' ');
                const slurm = buildSlurm(
                    parallelJobs,
                    o.gccVersion,
                    base,
                    exp.basePath,
                    exp.executable,
                    exp.experimentPath,
                    job_string,
                );

                console.log(slurm);
                await files.writeFile('auto_slurm.sh', slurm);

                execSync(`sbatch ${sbatch_args} auto_slurm.sh`);
                await files.removeRecursively('auto_slurm.sh');
            });
    }
};
