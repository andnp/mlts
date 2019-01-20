import { TensorflowDataset } from '../tensorflow/TensorflowDataset';
import * as susy from '../local/susy_complete';
import { Dataset } from 'mlts-experiment-data';

export class SusyComplete extends TensorflowDataset {
    static async load(location?: string) {
        const d = await susy.load(location);
        return SusyComplete.fromDataset(d);
    }

    private static fromTensorflowDataset(d: TensorflowDataset) {
        return new SusyComplete(d.train[0], d.train[1], d.test[0], d.test[1]);
    }

    static fromDataset(d: Dataset) {
        const data = SusyComplete.fromTensorflowDataset(super.fromDataset(d));

        return data.scaleColumns().oneHot(2);
    }
}
