import * as _ from 'lodash';
import { files, arrays, Observable } from 'utilities-ts';
import { getNumberOfRuns, ExperimentDescription, getExperimentSchema } from '../experiments';
import { printProgress } from '../utils/printer';

export async function findMissing(base_path: string, path: string, runs: number) {
    const raw_exp = await files.readJson(path, getExperimentSchema());
    const count = getNumberOfRuns(raw_exp.metaParameters) * runs;

    return printProgress(print => {
        return Observable.fromArray(arrays.range(count))
            .filter(async (i) => {
                const res_path = ExperimentDescription.getResultsPath(raw_exp, i);
                const full_path = `${base_path}/${res_path}/test.csv`;
                const found = files.fileExists(full_path);

                print(`Searching for missing results: ${((i / count) * 100).toPrecision(3)}%`);

                return !found;
            });
    });

}
