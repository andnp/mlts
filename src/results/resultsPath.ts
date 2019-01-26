import { files } from 'utilities-ts';
import { getParameterPermutation } from '../experiments/metaParameters';
import { getExperimentSchema } from '../experiments/ExperimentSchema';
import { interpolateResultsPath } from '../experiments/fileSystem';

export async function findResultsPath(rootPath: string, experimentPath: string, run: number) {
    const ExperimentSchema = getExperimentSchema();

    const experiment = await files.readJson(experimentPath, ExperimentSchema);
    const metaParameters = getParameterPermutation(experiment.metaParameters, run);

    const path = interpolateResultsPath({
        alg: experiment.algorithm,
        dataset: experiment.dataset,
        metaParameters,
        optimization: experiment.optimization,
        description: experiment,
        run,
    });
    const resultsPath = path.split('/').slice(0, -1).join('/');
    return files.filePath(`${rootPath}/${resultsPath}/results.json`);
}
