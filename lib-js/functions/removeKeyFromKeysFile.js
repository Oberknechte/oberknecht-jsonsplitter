"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeKeyFromKeysFile = void 0;
const oberknecht_utils_1 = require("oberknecht-utils");
const getKeyFromKeysFiles_1 = require("./getKeyFromKeysFiles");
const __1 = require("..");
function removeKeyFromKeysFile(sym, key) {
    let keyData = (0, getKeyFromKeysFiles_1.getKeyFromKeysFiles)(sym, key, true);
    if (!keyData.keysFilePath)
        return;
    let keysFilePath = keyData.keysFilePath;
    let keysFile = __1.i.splitterData[sym].actualKeysFile;
    let newFile = (0, oberknecht_utils_1.deleteKeyFromObject)(keysFile, ["keys", key]);
    (0, oberknecht_utils_1.addKeysToObject)(newFile, ["hasChanges"], true);
    __1.i.splitterData[sym].actualKeysFiles[keysFilePath] = newFile;
}
exports.removeKeyFromKeysFile = removeKeyFromKeysFile;
