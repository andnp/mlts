import { TensorflowDataset } from '../tensorflow/TensorflowDataset';
import { Dataset, GrayCifar10 as cifar } from 'mlts-experiment-data';

export class GreyCifar10 extends TensorflowDataset {
    static async load(location?: string) {
        const d = await cifar.load(location);
        return GreyCifar10.fromDataset(d);
    }

    private static fromTensorflowDataset(d: TensorflowDataset) {
        return new GreyCifar10(d.train[0], d.train[1], d.test[0], d.test[1]);
    }

    static fromDataset(d: Dataset) {
        const data = GreyCifar10.fromTensorflowDataset(super.fromDataset(d));
        return data.scaleByConstant(255).oneHot(10);
    }
}
