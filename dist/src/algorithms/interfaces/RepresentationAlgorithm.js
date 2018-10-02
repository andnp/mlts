"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function isRepresentationAlgorithm(x) {
    return 'getRepresentation' in x && typeof x.getRepresentation === 'function';
}
exports.isRepresentationAlgorithm = isRepresentationAlgorithm;
//# sourceMappingURL=RepresentationAlgorithm.js.map