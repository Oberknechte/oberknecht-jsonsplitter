"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.joinCacheKeyPath = void 0;
const oberknecht_utils_1 = require("oberknecht-utils");
function joinCacheKeyPath(keypath) {
    return (0, oberknecht_utils_1.convertToArray)(keypath).join(",");
}
exports.joinCacheKeyPath = joinCacheKeyPath;
