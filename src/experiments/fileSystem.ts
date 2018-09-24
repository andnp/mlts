import * as path from 'path';
import * as hash from 'object-hash';

import { ExperimentJson } from 'experiments/ExperimentSchema';

export const getResultsPath = (experiment: ExperimentJson, metaParameters: object, run: number) => {
    return path.join(hash({ ...experiment, metaParameters}), `${run}`);
};
