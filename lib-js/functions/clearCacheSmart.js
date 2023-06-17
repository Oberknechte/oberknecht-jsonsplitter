"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearCacheSmart = void 0;
const __1 = require("..");
const _log_1 = require("./_log");
function clearCacheSmart(sym, excludeMainFiles) {
    if (__1.i.splitterData[sym]._options?.debug > 2)
        (0, _log_1._log)(0, `[CACHE] [SMART] Clearing`);
    let clearedFiles = 0;
    let clearedMainFiles = 0;
    Object.keys(__1.i.splitterData[sym].actualFiles).forEach((a) => {
        let b = __1.i.splitterData[sym].actualFiles[a];
        if (b.lastUsed &&
            b.lastUsed <=
                Date.now() - __1.i.splitterData[sym]._options.cacheSettings.maxFileCacheAge) {
            clearedFiles++;
            delete __1.i.splitterData[sym].actualFiles[a];
        }
    });
    if (!(excludeMainFiles ??
        __1.i.splitterData[sym]._options.cacheSettings.noMainfileClear)) {
        Object.keys(__1.i.splitterData[sym].actualMainFiles).forEach((a) => {
            let b = __1.i.splitterData[sym].actualMainFiles[a];
            if (b.lastUsed &&
                b.lastUsed <=
                    Date.now() -
                        __1.i.splitterData[sym]._options.cacheSettings.maxMainFileCacheAge) {
                clearedMainFiles++;
                delete __1.i.splitterData[sym].actualMainFiles[a];
            }
        });
    }
    let filesnum = Object.keys(__1.i.splitterData[sym].actualFiles).length;
    let mainfilesnum = Object.keys(__1.i.splitterData[sym].actualMainFiles).length;
    if (__1.i.splitterData[sym]._options?.debug > 2)
        (0, _log_1._log)(0, `[CACHE] [SMART] Cleared ${clearedFiles} Files (${filesnum + clearedFiles} → ${filesnum}) and ${clearedMainFiles} Mainfiles (${mainfilesnum + clearedMainFiles} → ${mainfilesnum})`);
}
exports.clearCacheSmart = clearCacheSmart;
