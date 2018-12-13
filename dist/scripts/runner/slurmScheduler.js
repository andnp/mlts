"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utilities_ts_1 = require("utilities-ts");
const src_1 = require("../../src");
const child_process_1 = require("child_process");
const parseCLI_1 = require("./parseCLI");
exports.gigs = (m) => `${m}G`;
exports.hours = (h) => `${h - 1}:59:00`;
const buildSlurm = (cpus, gcc_version, base_path, results_path, executable, expPath, run_str) => `#!/bin/bash
module load gcc/${gcc_version}

cd ${base_path}
parallel -j${cpus} --delay 1 srun -N1 -n1 npm run exec -- ${executable} -e ${expPath} -r ${results_path} -s $SCRATCH/savedModels -i ::: ${run_str}
`;
exports.schedule = async (o) => {
    const exps = await parseCLI_1.parseCLI();
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
        await src_1.results.findMissing(exp.basePath, exp.experimentPath, exp.repeats)
            .group(each)
            // this needs to happen synchronously
            .bottleneck(1)
            .map(async (job) => {
            if (job.length === 0)
                return;
            const job_string = job.join(' ');
            const slurm = buildSlurm(parallelJobs, o.gccVersion, base, exp.basePath, exp.executable, exp.experimentPath, job_string);
            console.log(slurm);
            await utilities_ts_1.files.writeFile('auto_slurm.sh', slurm);
            child_process_1.execSync(`sbatch ${sbatch_args} auto_slurm.sh`);
            await utilities_ts_1.files.removeRecursively('auto_slurm.sh');
        });
    }
};
//# sourceMappingURL=slurmScheduler.js.map