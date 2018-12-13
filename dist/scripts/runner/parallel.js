"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// tslint:disable no-console
const _ = require("lodash");
const child_process_1 = require("child_process");
const src_1 = require("../../src");
const defaultOptions = {
    base_cmd: 'parallel',
    setup: '',
};
exports.run = async (exps, opts) => {
    const o = _.merge({}, defaultOptions, opts);
    let cmd = o.base_cmd;
    cmd += o.parallel_jobs ? ` -j${o.parallel_jobs}` : '';
    cmd += o.delay ? ` --delay ${o.delay}` : '';
    cmd += o.remotes ? ' -S ' + o.remotes.join(' -S ') : '';
    cmd += o.workdir ? ` --workdir ${o.workdir}` : '';
    const reslot = o.reslot || 10000;
    for (const exp of exps) {
        const basePath = exp.basePath;
        const missing = await src_1.results.findMissing(basePath, exp.experimentPath, exp.repeats).collect();
        if (missing.length === 0)
            continue;
        const executable = exp.executable;
        const expPath = exp.experimentPath;
        const run_str = missing.join(' ');
        console.log(`Running <${expPath}> for <${exp.number_runs}> times`);
        console.log(`Completed ${exp.number_runs - missing.length} of ${exp.number_runs}. ${((exp.number_runs - missing.length) / missing.length).toPrecision(2)}%`);
        const execStr = `${cmd} "${o.setup}; npm run exec -- ${executable} --reslot ${reslot} --slotId {%} --gpu -e ${expPath} -r ${basePath} -i {}" ::: ${run_str}`;
        child_process_1.execSync(execStr, { stdio: 'inherit', shell: '/bin/zsh' });
    }
};
//# sourceMappingURL=parallel.js.map