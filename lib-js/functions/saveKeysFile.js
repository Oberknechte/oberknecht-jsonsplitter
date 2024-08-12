"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveKeysFile = saveKeysFile;
const __1 = require("..");
const _wf_1 = require("./_wf");
const debugLog_1 = require("./debugLog");
const uncorrectPath_1 = require("./uncorrectPath");
function saveKeysFile(sym, keysFilePath) {
    (0, debugLog_1.debugLog)(sym, "saveKeysFile", ...arguments);
    let keysFile = __1.i.splitterData[sym].keysFiles[keysFilePath]?.() ??
        __1.i.splitterData[sym].actualKeysFiles[keysFilePath];
    if (keysFile.hasChanges)
        delete keysFile.hasChanges;
    (0, _wf_1._wf)(sym, (0, uncorrectPath_1.uncorrectpath)(keysFilePath), keysFile);
}
