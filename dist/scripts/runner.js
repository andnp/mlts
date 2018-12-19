"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// tslint:disable no-console
const parallel = require("./runner/parallel");
const parseCLI_1 = require("./runner/parseCLI");
const child_process_1 = require("child_process");
const utilities_ts_1 = require("utilities-ts");
const cores = 4;
const remotes = [
    `${cores}/129.128.159.203`,
];
const projectFolder = process.cwd().replace('/home/andy', '~');
const run = async () => {
    const exps = await parseCLI_1.parseCLI();
    // before doing anything else, first make sure the build is up-to-date
    child_process_1.execSync('npm run build');
    const ips = remotes.map(r => r.split('/')[1]);
    // pull and build on all remotes
    await utilities_ts_1.promise.map(ips, ip => {
        child_process_1.execSync(`ssh ${ip} "source ~/.zshrc; cd ${projectFolder}; git pull; npm run build;"`);
    });
    await parallel.run(exps, {
        remotes: [
            `${cores}/:`,
            ...remotes,
        ],
        workdir: '.',
        setup: 'source ~/.zshrc',
        delay: 1,
        reslot: cores,
    });
    // zip up results
    await utilities_ts_1.promise.map(ips, ip => {
        child_process_1.execSync(`ssh ${ip} "cd ${projectFolder}; tar -czvf results.tar.gz ${exps[0].basePath}"`);
    });
    // synchronously download and unzip results
    for (const ip of ips) {
        child_process_1.execSync(`scp ${ip}:${projectFolder}/results.tar.gz ./`);
        child_process_1.execSync(`tar -xzvf results.tar.gz`);
    }
};
run().catch(console.log).then(() => process.exit(0));
//# sourceMappingURL=runner.js.map