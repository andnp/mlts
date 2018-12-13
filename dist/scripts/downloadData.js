"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// The data downloader doesn't know how to behave when many
// machines are running it in parallel. To resolve this,
// this script will simply download all of the data file
// initially; before any experiments are run
require("@tensorflow/tfjs-node");
const data_1 = require("../src/data");
const execute = async () => {
    await data_1.Deterding.load();
    await data_1.GreyCifar10.load();
    await data_1.Mnist.load();
    await data_1.FashionMnist.load();
    await data_1.SusyComplete.load();
};
execute().then(() => process.exit());
//# sourceMappingURL=downloadData.js.map