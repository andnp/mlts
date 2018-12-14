"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const utilities_ts_1 = require("utilities-ts");
const getBufferTypeString = (b) => {
    if (b instanceof Float32Array)
        return 'float32';
    if (b instanceof Int32Array)
        return 'int32';
    if (b instanceof Uint8Array)
        return 'uint8';
    throw utilities_ts_1.assertNever(b, 'Unexpected buffer received');
};
const getBufferEncoding = (b) => {
    if (b === 'float32')
        return 13;
    if (b === 'int32')
        return 12;
    if (b === 'uint8')
        return 8;
    throw utilities_ts_1.assertNever(b, 'Unexpected buffer type string received');
};
const getBufferType = (b) => {
    if (b === 13)
        return Float32Array;
    if (b === 12)
        return Int32Array;
    if (b === 8)
        return Uint8Array;
    throw new Error('Unexpected buffer type received');
};
const getBufferSizeOffset = (b) => {
    if (b === 13)
        return 4;
    if (b === 12)
        return 4;
    if (b === 8)
        return 1;
    throw new Error('Unexpected buffer type received');
};
async function saveBits(data, shape, file) {
    await utilities_ts_1.files.createFolder(file);
    const stream = fs.createWriteStream(file, "binary");
    const bufferType = getBufferTypeString(data);
    const headerSize = 4 + shape.length * 4;
    const header = Buffer.alloc(headerSize, 0);
    // first two bytes are always 0
    header.writeUInt16BE(0, 0);
    // next byte shows the data type
    header.writeUInt8(getBufferEncoding(bufferType), 2);
    // 4th byte shows the number of dimensions
    header.writeUInt8(shape.length, 3);
    // remainder of header should encode the size of each dim
    for (let d = 0; d < shape.length; ++d) {
        header.writeUInt32BE(shape[d], 4 + 4 * d);
    }
    // go ahead and write the header
    stream.write(header);
    // write the data to the file
    const enc = getBufferEncoding(bufferType);
    const sizeOffset = getBufferSizeOffset(enc);
    const buf = Buffer.alloc(data.length * sizeOffset, 0);
    for (let i = 0; i < data.length; ++i) {
        if (bufferType === 'float32')
            buf.writeFloatBE(data[i], i * sizeOffset);
        else if (bufferType === 'int32')
            buf.writeInt32BE(data[i], i * sizeOffset);
        else if (bufferType === 'uint8')
            buf.writeUInt8(data[i], i * sizeOffset);
    }
    stream.write(buf);
    stream.close();
    return new Promise(resolve => stream.on('close', resolve));
}
exports.saveBits = saveBits;
function loadBits(file) {
    const stream = fs.createReadStream(file);
    let data;
    let type;
    let dims;
    const shape = [];
    let idx = 0;
    stream.on('readable', () => {
        const buf = stream.read();
        if (!buf)
            return;
        let start = 0;
        // on first data, get header info
        if (!data) {
            type = buf.readUInt8(2);
            dims = buf.readUInt8(3);
            let expectedData = 1;
            for (let d = 0; d < dims; ++d) {
                const dimSize = buf.readUInt32BE(4 + 4 * d);
                shape.push(dimSize);
                expectedData *= dimSize;
            }
            start = 4 + 4 * dims;
            const Buf = getBufferType(type);
            data = new Buf(expectedData);
        }
        // the end of the buffer needs to be offset
        // by the number of bytes the unit takes up
        const sizeOffset = getBufferSizeOffset(type);
        for (let i = 0; i < ((buf.length - start) / sizeOffset); i++) {
            if (type === 13)
                data[idx++] = buf.readFloatBE(start + i * sizeOffset);
            else if (type === 12)
                data[idx++] = buf.readInt32BE(start + i * sizeOffset);
            else if (type === 8)
                data[idx++] = buf.readUInt8(start + i * sizeOffset);
        }
    });
    return new Promise((resolve, reject) => {
        stream.on('end', () => {
            if (!data)
                return reject(new Error('No data found!'));
            const tensor = {
                shape,
                type: getBufferTypeString(data),
                data,
            };
            resolve(tensor);
        });
    });
}
exports.loadBits = loadBits;
//# sourceMappingURL=idx.js.map