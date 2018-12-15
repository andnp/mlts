"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seconds = (x) => x * 1000;
exports.minutes = (x) => 60 * exports.seconds(x);
exports.hours = (x) => 60 * exports.minutes(x);
exports.days = (x) => 24 * exports.hours(x);
exports.getUTC = () => new Date().getTime();
exports.toIso = (time) => new Date(time).toISOString();
//# sourceMappingURL=time.js.map