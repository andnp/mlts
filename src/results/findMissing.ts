import * as _ from 'lodash';
import { files, arrays, Observable } from 'utilities-ts';
import { getNumberOfRuns, getExperimentSchema, ExperimentJson, getParameterPermutation, interpolateResultsPath, experimentJsonToContext } from '../experiments';
import { printProgress } from '../utils/printer';

export function findMissing(base_path: string, path: string, runs: number) {
    return printProgress(print => {
        let exp: ExperimentJson;
        let count: number;
        return Observable.fromPromises([ files.readJson(path, getExperimentSchema()) ])
            .subscribe(raw_exp => exp = raw_exp)
            .subscribe(raw_exp => count = getNumberOfRuns(raw_exp.metaParameters) * runs)
            .flatMap(() => arrays.range(getNumberOfRuns(exp.metaParameters) * runs))
            // make sure process doesn't run out of memory servicing too many missing files
            .bottleneck(16)
            .filter(async (i) => {
                const metaParameters = getParameterPermutation(exp.metaParameters, i);
                const res_path = interpolateResultsPath({
                    ...experimentJsonToContext(exp),
                    metaParameters,
                    run: Math.floor(i / (count / runs)),
                });
                const full_path = `${base_path}/${res_path}/test.csv`;
                const found = await files.fileExists(full_path);

                print(`Searching for missing results: ${((i / count) * 100).toPrecision(3)}%`);

                return !found;
            });
    });

}
