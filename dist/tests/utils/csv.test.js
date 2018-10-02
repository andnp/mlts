"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const csv_1 = require("utils/csv");
const buffers = require("utils/buffers");
const files_1 = require("utils/files");
test('Can read a CSV file', () => __awaiter(this, void 0, void 0, function* () {
    const testCsvString = `1,2\n3,4\n5,6`;
    fs.writeFileSync('test.csv', testCsvString);
    const buffer = new Uint8Array(6);
    const mat = yield csv_1.loadCsvToBuffer({ path: 'test.csv', buffer });
    expect(buffers.toArray(mat)).toEqual([1, 2, 3, 4, 5, 6]);
    yield files_1.removeRecursively('test.csv');
}));
//# sourceMappingURL=csv.test.js.map