import * as _ from 'lodash';
import { files, arrays, Observable } from 'utilities-ts';
import { getNumberOfRuns, ExperimentDescription, getExperimentSchema, ExperimentJson } from '../experiments';
import { printProgress } from '../utils/printer';

export function findMissing(base_path: string, path: string, runs: number) {
    return printProgress(print => {
        let exp: ExperimentJson;
        return Observable.fromPromises([ files.readJson(path, getExperimentSchema()) ])
            .subscribe(raw_exp => exp = raw_exp)
            .flatMap(() => arrays.range(getNumberOfRuns(exp.metaParameters) * runs))
            // make sure process doesn't run out of memory servicing too many missing files
            .bottleneck(256)
            .filter(async (i) => {
                const res_path = ExperimentDescription.getResultsPath(exp, i);
                const full_path = `${base_path}/${res_path}/test.csv`;
                const found = await files.fileExists(full_path);

                const count = getNumberOfRuns(exp.metaParameters) * runs;
                print(`Searching for missing results: ${((i / count) * 100).toPrecision(3)}%`);

                return !found;
            });
    });

}
