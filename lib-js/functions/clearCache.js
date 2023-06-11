"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearCache = void 0;
const __1 = require("..");
const _log_1 = require("./_log");
function clearCache(sym, excludeMainFiles) {
    if (__1.i.splitterData[sym]._options?.debug >= 2)
        (0, _log_1._log)(0, `[CACHE] Clearing`);
    __1.i.splitterData[sym].actualFiles = {};
    if (!(excludeMainFiles ??
        __1.i.splitterData[sym]._options.cacheSettings.noMainfileClear))
        __1.i.splitterData[sym].actualMainFiles = {};
}
exports.clearCache = clearCache;
