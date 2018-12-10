"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// tslint:disable no-console
const utilities_ts_1 = require("utilities-ts");
class Experiment {
    constructor(description) {
        this.description = description;
    }
    run(root = 'results') {
        const obs = utilities_ts_1.Observable.create(creator => this._run(creator).then(creator.end));
        // prefix all of the paths with the root path
        // before passing the message on to the consumer
        return obs.map(msg => ({
            ...msg,
            path: `${root}/${msg.path}`,
        }));
    }
    static saveResults(obs) {
        return obs.subscribe(msg => {
            if (msg.type === 'txt')
                return utilities_ts_1.files.writeFile(msg.path, msg.data);
            if (msg.type === 'json')
                return utilities_ts_1.files.writeJson(msg.path, msg.data);
            if (msg.type === 'csv')
                return utilities_ts_1.csv.writeCsv(msg.path, msg.data);
            throw utilities_ts_1.assertNever(msg);
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