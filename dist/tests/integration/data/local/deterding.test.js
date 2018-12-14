"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const utilities_ts_1 = require("utilities-ts");
const deterding = require("data/local/deterding");
jest.setTimeout(utilities_ts_1.time.minutes(5));
test('Can download and load the datafile', async () => {
    const root = '.test';
    const filePath = `${root}/deterding.tar.gz`;
    const alreadyExists = await utilities_ts_1.files.fileExists(filePath);
    if (alreadyExists)
        await utilities_ts_1.files.removeRecursively(filePath);
    await deterding.download(root);
    process.stdout.write(`here`);
    const existsNow = await utilities_ts_1.files.fileExists(filePath);
    expect(existsNow).toBe(true);
    const unzipped = await utilities_ts_1.files.fileExists(`${root}/deterding`);
    expect(unzipped).toBe(true);
    const data = await deterding.load(root);
    const [X, Y] = data.train;
    const [T, TY] = data.test;
    expect(data.description()).toEqual({
        classes: 11,
        features: 10,
        samples: 528,
        testSamples: 462,
    });
    expect(_.sum(X.getRow(0))).toBeCloseTo(4.498563699424267);
    expect(Y.getRow(0)).toEqual([0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0]);
    expect(_.sum(T.getRow(0))).toBeCloseTo(4.64417852461338);
    expect(TY.getRow(0)).toEqual([0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0]);
});
//# sourceMappingURL=deterding.test.js.map