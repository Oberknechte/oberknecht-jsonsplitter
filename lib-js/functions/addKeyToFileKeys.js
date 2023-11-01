"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addKeyToFileKeys = void 0;
const oberknecht_utils_1 = require("oberknecht-utils");
const __1 = require("..");
const checkSize_1 = require("./checkSize");
const jsonsplitter_1 = require("../types/jsonsplitter");
const parseKeysFilePath_1 = require("./parseKeysFilePath");
const getKeysFiles_1 = require("./getKeysFiles");
const _wf_1 = require("./_wf");
const saveKeysFile_1 = require("./saveKeysFile");
function addKeyToFileKeys(sym, mainFilePath, key, value) {
    let keysFilePath = Object.keys(__1.i.splitterData[sym].keysFiles).at(-1);
    let keysFile;
    if (!keysFilePath) {
        keysFilePath = (0, parseKeysFilePath_1.parseKeysFilePath)(mainFilePath, "keys0.json");
        (0, _wf_1._wf)(sym, keysFilePath, {}, "keysFile");
        (0, getKeysFiles_1.getKeysFiles)(sym);
        keysFile = __1.i.splitterData[sym].keysFiles[keysFilePath]();
    }
    let lastFileNum = parseInt(keysFilePath.replace(/.+keys(?=\d+\.json$)/, "").replace(/\.json$/, ""));
    if (!keysFile)
        keysFile = __1.i.splitterData[sym].keysFiles[keysFilePath]?.() ?? {};
    if ((0, checkSize_1.checkSize)(sym, keysFile, (0, oberknecht_utils_1.addKeysToObject)({}, ["keys", key], value), __1.i.splitterData[sym]._options.maxKeysFileSize ?? jsonsplitter_1.defaultKeysFileSize)) {
        (0, saveKeysFile_1.saveKeysFile)(sym, keysFilePath);
        keysFilePath = (0, parseKeysFilePath_1.parseKeysFilePath)(mainFilePath, `keys${lastFileNum + 1}.json`);
        (0, _wf_1._wf)(sym, keysFilePath, JSON.stringify({}));
        (0, getKeysFiles_1.getKeysFiles)(sym);
        keysFile = __1.i.splitterData[sym].keysFiles[keysFilePath]();
    }
    let newFile = (0, oberknecht_utils_1.addKeysToObject)(keysFile, ["keys", key], value);
    (0, oberknecht_utils_1.addKeysToObject)(newFile, ["hasChanges"], true);
    __1.i.splitterData[sym].actualKeysFiles[keysFilePath] = newFile;
    return newFile;
}
exports.addKeyToFileKeys = addKeyToFileKeys;
