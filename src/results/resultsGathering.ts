// tslint:disable no-console
import * as _ from 'lodash';
import { parameterLens, lens, where } from './processing';
import { Result, collectResults } from './collectResults';

type Filter = (res: Result[]) => Result[];
export const createParameterFilter = (fixed: Record<string, string | number>): Filter => {
    const filters = Object.keys(fixed).map(key => {
        const filterLens = _.flow(
            parameterLens,
            lens(key),
        );

        return _.partial(where, filterLens, fixed[key]);
    });

    return (_.flow as any)(...filters);
};

const collect = _.memoize((path: string, resultFiles: string[]) => {
    return collectResults(path, resultFiles).collect();
});

export const collectAndFilter = async (path: string, resultFiles: string[], filter: Filter) => {
    const res = await collect(path, resultFiles);
    console.log(`Found <${res.length}> result files`);

    const countLens = _.flow(
        lens('train.csv'),
        lens('description'),
        lens('count'),
    );

    const filtered = filter(res);
    console.log(`Filtered down to <${filtered.length}> results`);
    const totalFiles = filtered.map(countLens).reduce((t, x) => t + x, 0);
    console.log(`With <${totalFiles}> total files`);

    return filtered;
};
