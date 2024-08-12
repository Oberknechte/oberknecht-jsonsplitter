"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearCache = clearCache;
const __1 = require("..");
const _log_1 = require("./_log");
const debugLog_1 = require("./debugLog");
function clearCache(sym, excludeMainFiles) {
    (0, debugLog_1.debugLog)(sym, "clearCache", ...arguments);
    if (__1.i.splitterData[sym]._options?.debug > 2)
        (0, _log_1._log)(0, `[CACHE] Clearing`);
    __1.i.splitterData[sym].actualFiles = {};
    if (!(excludeMainFiles ??
        __1.i.splitterData[sym]._options.cacheSettings.noMainfileClear))
        __1.i.splitterData[sym].actualMainFiles = {};
}
