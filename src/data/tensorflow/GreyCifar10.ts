import { TensorflowDataset } from 'data/tensorflow/TensorflowDataset';
import * as cifar from 'data/local/gray_cifar10';
import { Data } from 'data/local/Data';

export class GreyCifar10 extends TensorflowDataset {
    static async load(location?: string) {
        const d = await cifar.load(location);
        return GreyCifar10.fromDataset(d);
    }

    private static fromTensorflowDataset(d: TensorflowDataset) {
        return new GreyCifar10(d.train[0], d.train[1], d.test[0], d.test[1]);
    }

    static fromDataset(d: Data) {
        const data = GreyCifar10.fromTensorflowDataset(super.fromDataset(d));
        return data.scaleByConstant(255).oneHot(10);
    }
}
