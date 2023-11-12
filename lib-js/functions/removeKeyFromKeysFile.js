"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeKeyFromKeysFile = void 0;
const oberknecht_utils_1 = require("oberknecht-utils");
const getKeyFromKeysFiles_1 = require("./getKeyFromKeysFiles");
const __1 = require("..");
const debugLog_1 = require("./debugLog");
function removeKeyFromKeysFile(sym, keypath) {
    (0, debugLog_1.debugLog)(sym, "removeKeyFromKeysFile", ...arguments);
    let keypath_ = (0, oberknecht_utils_1.convertToArray)(keypath);
    let key = keypath_[__1.i.splitterData[sym]._options.child_folders_keys];
    let keyData = (0, getKeyFromKeysFiles_1.getKeyFromKeysFiles)(sym, keypath, true);
    if (!keyData.keysFilePath)
        return;
    let keysFilePath = keyData.keysFilePath;
    let keysFile = __1.i.splitterData[sym].actualKeysFile;
    let newFile = (0, oberknecht_utils_1.deleteKeyFromObject)(keysFile, ["keys", key]);
    (0, oberknecht_utils_1.addKeysToObject)(newFile, ["hasChanges"], true);
    __1.i.splitterData[sym].actualKeysFiles[keysFilePath] = newFile;
}
exports.removeKeyFromKeysFile = removeKeyFromKeysFile;
