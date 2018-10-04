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
const results_1 = require("../src/results");
// tslint:disable no-console
function execute() {
    return __awaiter(this, void 0, void 0, function* () {
        if (process.argv.length !== 5) {
            console.log('Please call again using: ');
            console.log('ts-node scripts/findResultsPath.ts {resultsBaseDir} {experimentFile} {index}');
            process.exit(0);
        }
        const run = parseInt(process.argv[4]);
        const experimentPath = process.argv[3];
        const rootPath = process.argv[2];
        const resultsPath = yield results_1.findResultsPath(rootPath, experimentPath, run);
        console.log(resultsPath);
    });
}
execute();
//# sourceMappingURL=findResultsPath.js.map