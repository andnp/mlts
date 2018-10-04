import { ExperimentDescription } from "./ExperimentDescription";
import { getClassificationError } from "../analysis";
import { files } from "utilities-ts";

export class ClassificationErrorExperiment {
    constructor (
        protected description: ExperimentDescription,
    ) {}

    async run(root = 'results') {
        const alg = this.description.algorithm;
        const d = this.description.dataset;

        await alg.build();

        const [ X, Y ] = d.train;

        await alg.train(X, Y, this.description.optimization, { autosave: false });

        const [ T, TY ] = d.test;

        const Y_hat = await alg.predict(X, this.description.optimization);
        const TY_hat = await alg.predict(T, this.description.optimization);

        const trainError = getClassificationError(Y_hat, Y).get();
        const testError = getClassificationError(TY_hat, TY).get();

        const params = alg.getParameters();

        const resultsPath = files.filePath(`${root}/${this.description.path}`);

        await files.writeFile(files.filePath(`${resultsPath}/test.csv`), testError);
        await files.writeFile(files.filePath(`${resultsPath}/train.csv`), trainError);

        await files.writeJson(files.filePath(`${resultsPath}/params.json`), params);
        await files.writeJson(files.filePath(`${resultsPath}/experiment.json`), this.description.definition);
    }
}
