"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function discriminatedObject(name, arr) {
    return arr.reduce((coll, obj) => {
        coll[obj[name]] = obj;
        return coll;
    }, {});
}
exports.discriminatedObject = discriminatedObject;
//# sourceMappingURL=objects.js.map