"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../../../utils");
test('Can generate fake data for use in unit tests', () => {
    const dataset = utils_1.getFakeClassificationDataset({
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
//# sourceMappingURL=fakeData.test.js.map