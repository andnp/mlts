import * as _ from 'lodash';
import { files } from 'utilities-ts';
import { getNumberOfRuns, ExperimentDescription, getExperimentSchema } from '../experiments';

export async function findMissing(base_path: string, path: string, runs: number) {
    const paths = await files.glob(`${base_path}/**/test.csv`);
    const raw_exp = await files.readJson(path, getExperimentSchema());

    const count = getNumberOfRuns(raw_exp.metaParameters);
    const incomplete = [] as number[];
    for (let i = 0; i < count * runs; ++i) {
        const res_path = ExperimentDescription.getResultsPath(raw_exp, i);

        const full_path = `${base_path}/${res_path}`;

        const found = paths.find(p => p.startsWith(full_path));
        if (!found) incomplete.push(i);
    }

    return incomplete;
}
