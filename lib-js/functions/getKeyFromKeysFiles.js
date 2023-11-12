"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getKeyFromKeysFiles = void 0;
const oberknecht_utils_1 = require("oberknecht-utils");
const __1 = require("..");
const debugLog_1 = require("./debugLog");
// : withKeysFilePathType extends true ? getKeyFromKeysFileReturnExtended | {} : getKeyFromKeysFileReturn | undefined
function getKeyFromKeysFiles(sym, keypath, withKeysFilePath) {
    (0, debugLog_1.debugLog)(sym, "getKeyFromKeysFiles", ...arguments);
    let keypath_ = (0, oberknecht_utils_1.convertToArray)(keypath);
    let val;
    let keysFilePath;
    let key = keypath_[__1.i.splitterData[sym]._options.child_folders_keys];
    function searchFile(files, n) {
        let keysFilePath_ = files[n];
        if (!keysFilePath_)
            return;
        let keysFile = __1.i.splitterData[sym].keysFiles[keysFilePath_]();
        let val_ = (0, oberknecht_utils_1.getKeyFromObject)(keysFile, ["keys", key]);
        if (!(0, oberknecht_utils_1.isNullUndefined)(val_)) {
            val = val_;
            keysFilePath = keysFilePath_;
            return;
        }
        searchFile(files, n + 1);
    }
    let searchKeysFiles = Object.keys(__1.i.splitterData[sym].keysFiles).filter((a) => a
        .replace(__1.i.splitterData[sym]._options.startpath, "")
        .replace(/^\//, "")
        .split(/\/keys\/keys\d+\.json$/)[0]
        .split("/")
        .join("\u0001") ===
        keypath_
            .slice(0, __1.i.splitterData[sym]._options.child_folders_keys)
            .join("\u0001"));
    searchFile(searchKeysFiles, 0);
    return withKeysFilePath
        ? {
            value: val,
            keysFilePath: keysFilePath,
        }
        : val;
}
exports.getKeyFromKeysFiles = getKeyFromKeysFiles;
