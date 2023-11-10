"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getKeysForMainFile = void 0;
const oberknecht_utils_1 = require("oberknecht-utils");
const __1 = require("..");
const getKeysFiles_1 = require("./getKeysFiles");
const debugLog_1 = require("./debugLog");
function getKeysForMainFile(sym, mainFilePath) {
    (0, debugLog_1.debugLog)(sym, "getKeysForMainFile", ...arguments);
    let keys = {};
    (0, getKeysFiles_1.getKeysFiles)(sym);
    Object.keys(__1.i.splitterData[sym].keysFiles)
        .filter((a) => new RegExp(`${mainFilePath.replace(/\/_main\.json$/, "")}\\/keys\\/keys\\d+`).test(a))
        .forEach((keysFilePath) => {
        let keysFile = __1.i.splitterData[sym].keysFiles[keysFilePath]();
        keys = (0, oberknecht_utils_1.concatJSON)([keys, keysFile.keys ?? {}]);
    });
    return keys;
}
exports.getKeysForMainFile = getKeysForMainFile;
