// tslint:disable no-console
import * as parallel from './runner/parallel';
import { parseCLI } from './runner/parseCLI';
import { execSync } from 'child_process';
import { promise } from 'utilities-ts';

const cores = 4;

const remotes = [
    `${cores}/129.128.159.203`,
];

const projectFolder = "~/Projects/research/functional_tasks/experiments";

const run = async () => {
    const exps = await parseCLI();

    // before doing anything else, first make sure the build is up-to-date
    execSync('npm run build');

    const ips = remotes.map(r => r.split('/')[1]);

    // pull and build on all remotes
    await promise.map(ips, ip => {
        execSync(`ssh ${ip} "source ~/.zshrc; cd ${projectFolder}; git pull; npm run build;"`);
    });

    await parallel.run(exps, {
        remotes: [
            `${cores}/:`, // run on local machine
            ...remotes,
        ],
        workdir: '.',
        setup: 'source ~/.zshrc',
        delay: 1,
        reslot: cores,
    });

    // zip up results
    await promise.map(ips, ip => {
        execSync(`ssh ${ip} "cd ${projectFolder}; tar -czvf results.tar.gz ${exps[0].basePath}"`);
    });

    // synchronously download and unzip results
    for (const ip of ips) {
        execSync(`scp ${ip}:${projectFolder}/results.tar.gz ./`);
        execSync(`tar -xzvf results.tar.gz`);
    }
};

run().catch(console.log).then(() => process.exit(0));
