import { TensorflowDataset } from '../tensorflow/TensorflowDataset';
import * as mnist from '../local/mnist';
import { Data } from '../local/Data';

export class Mnist extends TensorflowDataset {
    static async load(location?: string) {
        const d = await mnist.load(location);
        return Mnist.fromDataset(d);
    }

    private static fromTensorflowDataset(d: TensorflowDataset) {
        return new Mnist(d.train[0], d.train[1], d.test[0], d.test[1]);
    }

    static fromDataset(d: Data) {
        const data = Mnist.fromTensorflowDataset(super.fromDataset(d));

        return data.scaleByConstant(255).oneHot(10);
    }
}
