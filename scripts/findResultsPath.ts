// tslint:disable no-console
import { files } from 'utilities-ts';
import { getParameterPermutation } from 'experiments/metaParameters';
import { getExperimentSchema } from 'experiments/ExperimentSchema';
import { getResultsPath } from 'experiments/fileSystem';

async function execute() {
    if (process.argv.length !== 5) {
        console.log('Please call again using: ');
        console.log('npm run file scripts/findResultsPath.ts {resultsBaseDir} {experimentFile} {index}');
        process.exit(0);
    }

    const ExperimentSchema = getExperimentSchema();

    const run = parseInt(process.argv[4]);

    const experiment = await files.readJson(process.argv[3], ExperimentSchema);
    const metaParameters = getParameterPermutation(experiment.metaParameters, run);

    const rootPath = process.argv[2];

    const path = getResultsPath(experiment, metaParameters, run);
    const resultsPath = path.split('/').slice(0, -1).join('/');
    console.log(files.filePath(`${rootPath}/${resultsPath}/results.json`));
}

execute();
