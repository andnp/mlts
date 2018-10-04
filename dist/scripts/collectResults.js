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
// tslint:disable no-console
const src_1 = require("../src");
const resultFileNames = ['originalH.txt', 'test.txt', 'train.txt'];
function execute() {
    return __awaiter(this, void 0, void 0, function* () {
        if (process.argv.length !== 3) {
            console.log('Please call again using: ');
            console.log('npm run file scripts/collectResults.ts {resultsDir}');
            process.exit(0);
        }
        const rootPath = process.argv[2];
        yield src_1.results.collectResults(rootPath, resultFileNames);
    });
}
execute();
//# sourceMappingURL=collectResults.js.map