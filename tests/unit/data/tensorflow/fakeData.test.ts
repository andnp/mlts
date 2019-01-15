import { getFakeClassificationDataset } from "../../../utils";

test('Can generate fake data for use in unit tests', () => {
    const dataset = getFakeClassificationDataset({
        samples: 100,
        features: 10,
        classes: 5,
    });

    expect(dataset.description()).toEqual({
        samples: 100 * 5,
        features: 10,
        classes: 5,
        testSamples: 100 * 5,
    });
});
