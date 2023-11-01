"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveKeysFile = void 0;
const __1 = require("..");
const _wf_1 = require("./_wf");
function saveKeysFile(sym, keysFilePath) {
    let keysFile = __1.i.splitterData[sym].keysFiles[keysFilePath]();
    if (keysFile.hasChanges)
        delete keysFile.hasChanges;
    (0, _wf_1._wf)(sym, keysFilePath, keysFile);
}
exports.saveKeysFile = saveKeysFile;
