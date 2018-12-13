// tslint:disable no-console
import * as _ from 'lodash';
import { execSync } from 'child_process';
import { ExperimentMetadata } from './parseCLI';
import { results } from '../../src';

interface ParallelOptions {
    base_cmd: string;
    parallel_jobs?: number;
    delay?: number;
    remotes?: string[];
    workdir?: string;
    setup: string;
    reslot?: number;
}

const defaultOptions: ParallelOptions = {
    base_cmd: 'parallel',
    setup: '',
};

export const run = async (exps: ExperimentMetadata[], opts?: Partial<ParallelOptions>) => {
    const o = _.merge({}, defaultOptions, opts);

    let cmd = o.base_cmd;
    cmd += o.parallel_jobs ? ` -j${o.parallel_jobs}` : '';
    cmd += o.delay ? ` --delay ${o.delay}` : '';
    cmd += o.remotes ? ' -S ' + o.remotes.join(' -S ') : '';
    cmd += o.workdir ? ` --workdir ${o.workdir}` : '';

    const reslot = o.reslot || 10000;

    for (const exp of exps) {
        const basePath = exp.basePath;
        const missing = await results.findMissing(basePath, exp.experimentPath, exp.repeats).collect();
        if (missing.length === 0) continue;

        const executable = exp.executable;
        const expPath = exp.experimentPath;
        const run_str = missing.join(' ');
        console.log(`Running <${expPath}> for <${exp.number_runs}> times`);
        console.log(`Completed ${exp.number_runs - missing.length} of ${exp.number_runs}. ${((exp.number_runs - missing.length) / missing.length).toPrecision(2)}%`);
        const execStr = `${cmd} "${o.setup}; npm run exec -- ${executable} --reslot ${reslot} --slotId {%} --gpu -e ${expPath} -r ${basePath} -i {}" ::: ${run_str}`;
        execSync(execStr, { stdio: 'inherit', shell: '/bin/zsh' });
    }
};
