"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const utilities_ts_1 = require("utilities-ts");
const mnist = require("data/local/mnist");
jest.setTimeout(utilities_ts_1.time.minutes(5));
test('Can download and load the datafile', async () => {
    const root = '.test';
    const filePath = `${root}/mnist.tar.gz`;
    const alreadyExists = await utilities_ts_1.files.fileExists(filePath);
    if (alreadyExists)
        await utilities_ts_1.files.removeRecursively(filePath);
    await mnist.download(root);
    const existsNow = await utilities_ts_1.files.fileExists(filePath);
    expect(existsNow).toBe(true);
    const unzipped = await utilities_ts_1.files.fileExists(`${root}/mnist`);
    expect(unzipped).toBe(true);
    const data = await mnist.load(root);
    expect(data.description()).toEqual({
        classes: 1,
        features: 784,
        samples: 60000,
        testSamples: 10000,
    });
    const [X, Y] = data.train;
    expect(_.sum(X.getRow(0))).toBe(27525);
    expect(Y.getRow(0)).toEqual([5]);
    const [T, TY] = data.test;
    expect(_.sum(T.getRow(0))).toBe(18454);
    expect(TY.getRow(0)).toEqual([7]);
});
//# sourceMappingURL=mnist.test.js.map