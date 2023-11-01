"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getKeyFromKeysFiles = void 0;
const oberknecht_utils_1 = require("oberknecht-utils");
const __1 = require("..");
// : withKeysFilePathType extends true ? getKeyFromKeysFileReturnExtended | {} : getKeyFromKeysFileReturn | undefined
function getKeyFromKeysFiles(sym, key, withKeysFilePath) {
    let val;
    let keysFilePath;
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
    searchFile(Object.keys(__1.i.splitterData[sym].keysFiles), 0);
    return withKeysFilePath
        ? {
            value: val,
            keysFilePath: keysFilePath,
        }
        : val;
}
exports.getKeyFromKeysFiles = getKeyFromKeysFiles;
