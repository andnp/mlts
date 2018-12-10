import * as _ from 'lodash';
import { files, arrays, Observable } from 'utilities-ts';
import { getNumberOfRuns, ExperimentDescription, getExperimentSchema } from '../experiments';
import { printProgress } from '../utils/printer';

export function findMissing(base_path: string, path: string, runs: number) {
    return printProgress(print => {
        return Observable.fromPromises([ files.readJson(path, getExperimentSchema()) ])
            .map(raw_exp => ({ exp: raw_exp, count: getNumberOfRuns(raw_exp.metaParameters) * runs}))
            .flatMap(d => arrays.range(d.count).map(i => ({ i, ...d })))
            .filter(async (data) => {
                const res_path = ExperimentDescription.getResultsPath(data.exp, data.i);
                const full_path = `${base_path}/${res_path}/test.csv`;
                const found = files.fileExists(full_path);

                print(`Searching for missing results: ${((data.i / data.count) * 100).toPrecision(3)}%`);

                return !found;
            })
            .map(data => data.i);
    });

}
