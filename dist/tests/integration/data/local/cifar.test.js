"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const utilities_ts_1 = require("utilities-ts");
const cifar = require("data/local/gray_cifar10");
jest.setTimeout(utilities_ts_1.time.minutes(5));
test('Can download and load the datafile', async () => {
    const root = '.test';
    const filePath = `${root}/gs_cifar10.tar.gz`;
    const alreadyExists = await utilities_ts_1.files.fileExists(filePath);
    if (alreadyExists)
        await utilities_ts_1.files.removeRecursively(filePath);
    await cifar.download(root);
    const existsNow = await utilities_ts_1.files.fileExists(filePath);
    expect(existsNow).toBe(true);
    const unzipped = await utilities_ts_1.files.fileExists(`${root}/cifar`);
    expect(unzipped).toBe(true);
    const data = await cifar.load(root);
    const [X, Y] = data.train;
    const [T, TY] = data.test;
    expect(data.description()).toEqual({
        classes: 1,
        features: 1024,
        samples: 50000,
        testSamples: 10000,
    });
    expect(_.sum(X.getRow(0))).toBe(113857);
    expect(Y.getRow(0)).toEqual([6]);
    expect(_.sum(T.getRow(0))).toBe(112480);
    expect(TY.getRow(0)).toEqual([3]);
});
//# sourceMappingURL=cifar.test.js.map