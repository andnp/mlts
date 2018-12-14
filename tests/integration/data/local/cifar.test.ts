import * as _ from 'lodash';
import { files, time } from 'utilities-ts';

import * as cifar from 'data/local/gray_cifar10';

jest.setTimeout(time.minutes(5));

test('Can download and load the datafile', async () => {
    const root = '.test';
    const filePath = `${root}/gs_cifar10.tar.gz`;
    const alreadyExists = await files.fileExists(filePath);

    if (alreadyExists) await files.removeRecursively(filePath);

    await cifar.download(root);

    const existsNow = await files.fileExists(filePath);
    expect(existsNow).toBe(true);

    const unzipped = await files.fileExists(`${root}/cifar`);
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
    expect(Y.getRow(0)).toEqual([ 6 ]);


    expect(_.sum(T.getRow(0))).toBe(112480);
    expect(TY.getRow(0)).toEqual([ 3 ]);
});
