"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const idx = require("idx-data");
const utilities_ts_1 = require("utilities-ts");
const fileSystem_1 = require("./fileSystem");
class Experiment {
    constructor(description) {
        this.description = description;
    }
    run(root = '') {
        const obs = utilities_ts_1.Observable.create(creator => {
            this._run(creator).then(creator.end);
            const alg = this.description.algorithm;
            const params = alg.getParameters();
            creator.next({
                tag: 'params',
                type: 'json',
                path: `../params.json`,
                data: params,
            });
            creator.next({
                tag: 'experiment',
                type: 'json',
                path: `../experiment.json`,
                data: this.description.definition,
            });
        });
        const resultsBase = this.description.resultsBase || '';
        const path = fileSystem_1.interpolateResultsPath(this.description);
        // prefix all of the paths with the root path
        // before passing the message on to the consumer
        return obs.map(msg => ({
            ...msg,
            path: [resultsBase, root, path, msg.path].filter(s => s !== '').join('/'),
        }));
    }
    static saveResults(obs) {
        return obs.subscribe(async (msg) => {
            // reduce chances of accidentally double writing a file
            const exists = await utilities_ts_1.files.fileExists(msg.path);
            if (exists)
                return;
            if (msg.type === 'idx')
                return idx.saveBits(new Float32Array(msg.data.buf), msg.data.shape, msg.path);
            if (msg.type === 'txt')
                return utilities_ts_1.files.writeFile(msg.path, msg.data);
            if (msg.type === 'json')
                return utilities_ts_1.files.writeJson(msg.path, msg.data);
            if (msg.type === 'csv')
                return utilities_ts_1.csv.writeCsv(msg.path, msg.data);
            throw utilities_ts_1.assertNever(msg.type);
        });
    }
    static printResults(obs) {
        return obs.subscribe(msg => {
            if (msg.tag === 'train')
                return console.log(`Train Error: ${msg.data}`);
            if (msg.tag === 'test')
                return console.log(`Test Error: ${msg.data}`);
        });
    }
}
exports.Experiment = Experiment;
//# sourceMappingURL=Experiment.js.map