// The data downloader doesn't know how to behave when many
// machines are running it in parallel. To resolve this,
// this script will simply download all of the data file
// initially; before any experiments are run
import '@tensorflow/tfjs-node';
import { Deterding, GreyCifar10, Mnist, FashionMnist, SusyComplete } from '../src/data';

const execute = async () => {
    await Deterding.load();
    await GreyCifar10.load();
    await Mnist.load();
    await FashionMnist.load();
    await SusyComplete.load();
};

execute().then(() => process.exit());
