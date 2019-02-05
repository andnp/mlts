// tslint:disable no-console
import * as v from 'validtyped';
import * as _ from 'lodash';
import { files } from 'utilities-ts';
import { commandLine, results, getParameterPermutation, flattenToArray } from "../src";
import { Result } from "../src/results";

const resultFiles = ['test.csv', 'train.csv'];

async function execute() {
    const res = await results.collectResults('results', resultFiles).collect();
    console.log(`Found <${res.length}> total results`);
    // const { e: expPath, i: index } = commandLine.parseArgs();
    // if (!expPath) throw new Error("Expected to be called with -e parameter");
    // if (!index) throw new Error("expected to be called with -i parameter");

    // const exp = await files.readJson(expPath, v.any());

    // const params: Record<string, any> = exp.metaParameters;

    // const sweep = getParameterPermutation(params, parseInt(index));
    // console.log(sweep);

    // const algorithm = exp.algorithm;
    // const dataset = exp.dataset;

    // const flattened = flattenToArray(sweep);

    // const filters = flattened.map(paramPair => {
    //     const [ path, [ value ] ] = paramPair;
    //     const lens = _.flow(
    //         results.parameterLens,
    //         results.lens(path),
    //     );

    //     return _.partial(results.where, lens, value);
    // });

    // const filter: (x: Result[]) => Result[] = (_.flow as any)(
    //     results.createAlgorithmDatasetFilter(algorithm, dataset),
    //     ...filters,
    // );

    // const filtered = filter(res);

    // console.log(JSON.stringify(filtered, undefined, 2));
}

execute().then(() => process.exit());
