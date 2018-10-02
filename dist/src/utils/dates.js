"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function getMostRecent(times) {
    const dates = times.map(t => new Date(t).getTime());
    const max = Math.max(...dates);
    return new Date(max);
}
exports.getMostRecent = getMostRecent;
//# sourceMappingURL=dates.js.map