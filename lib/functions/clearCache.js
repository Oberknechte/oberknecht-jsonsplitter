const _log = require("./_log");

function clearCache(sym, excludeMainFiles) {
    let i = require("..");
    if (i.splitterData[sym]._options?.debug >= 2) _log(0, `[CACHE] Clearing`);

    i.splitterData[sym].actualFiles = {};
    if (!(excludeMainFiles ?? i.splitterData[sym]._options.cacheSettings.noMainfileClear)) i.splitterData[sym].actualMainFiles = {};
};

module.exports = clearCache;