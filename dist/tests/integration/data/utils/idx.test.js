"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utilities_ts_1 = require("utilities-ts");
const idx = require("data/utils/idx");
test('Can write/read a simple uint8 idx file', async () => {
    const data = new Uint8Array([1, 2, 3, 4, 5, 6]);
    const shape = [2, 3];
    const file = '.test/test.uint8.idx';
    await idx.saveBits(data, shape, file);
    const idxTensor = await idx.loadBits(file);
    expect(idxTensor.shape).toEqual(shape);
    expect(idxTensor.type).toBe('uint8');
    expect(utilities_ts_1.buffers.toArray(idxTensor.data)).toEqual(utilities_ts_1.buffers.toArray(data));
});
test('Can write/read a simple int32 idx file', async () => {
    const data = new Int32Array([-3, -2, -1, 0, 1, 2]);
    const shape = [2, 3];
    const file = '.test/test.int32.idx';
    await idx.saveBits(data, shape, file);
    const idxTensor = await idx.loadBits(file);
    expect(idxTensor.shape).toEqual(shape);
    expect(idxTensor.type).toBe('int32');
    expect(utilities_ts_1.buffers.toArray(idxTensor.data)).toEqual(utilities_ts_1.buffers.toArray(data));
});
test('Can write/read a simple float32 idx file', async () => {
    const data = new Float32Array([-.3, -.2, -.1, 0, .1, .2]);
    const shape = [2, 3];
    const file = '.test/test.float32.idx';
    await idx.saveBits(data, shape, file);
    const idxTensor = await idx.loadBits(file);
    expect(idxTensor.shape).toEqual(shape);
    expect(idxTensor.type).toBe('float32');
    expect(utilities_ts_1.buffers.toArray(idxTensor.data)).toEqual(utilities_ts_1.buffers.toArray(data));
});
//# sourceMappingURL=idx.test.js.map