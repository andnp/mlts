import { TensorflowDataset } from '../tensorflow/TensorflowDataset';
import * as fashion_mnist from '../local/fashion_mnist';
import { Data } from '../local/Data';

export class FashionMnist extends TensorflowDataset {
    static async load(location?: string) {
        const d = await fashion_mnist.load(location);
        return FashionMnist.fromDataset(d);
    }

    private static fromTensorflowDataset(d: TensorflowDataset) {
        return new FashionMnist(d.train[0], d.train[1], d.test[0], d.test[1]);
    }

    static fromDataset(d: Data) {
        const data = FashionMnist.fromTensorflowDataset(super.fromDataset(d));

        return data.scaleByConstant(255).oneHot(10);
    }
}
