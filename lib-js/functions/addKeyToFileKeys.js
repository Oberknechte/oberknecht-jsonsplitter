"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addKeyToFileKeys = addKeyToFileKeys;
const oberknecht_utils_1 = require("oberknecht-utils");
const __1 = require("..");
const checkSize_1 = require("./checkSize");
const jsonsplitter_1 = require("../types/jsonsplitter");
const parseKeysFilePath_1 = require("./parseKeysFilePath");
const getKeysFiles_1 = require("./getKeysFiles");
const saveKeysFile_1 = require("./saveKeysFile");
const debugLog_1 = require("./debugLog");
function addKeyToFileKeys(sym, mainFilePath, chunk, alwaysNew) {
    (0, debugLog_1.debugLog)(sym, "addKeyToFileKeys", ...arguments);
    let keysFilePath = Object.keys(__1.i.splitterData[sym].keysFiles)
        .filter((a) => a.replace(/keys\/keys\d+\.json$/, "_main.json") === mainFilePath)
        .sort((a, b) => parseInt(a.replace(/.+keys(?=\d+\.json$)/, "").replace(/\.json$/, "")) -
        parseInt(b.replace(/.+keys(?=\d+\.json$)/, "").replace(/\.json$/, "")))
        .at(-1)
        ?.toString();
    let keysFile;
    let isFirst = false;
    let isNew = false;
    if (!keysFilePath) {
        keysFilePath = (0, parseKeysFilePath_1.parseKeysFilePath)(mainFilePath, "keys0.json");
        __1.i.splitterData[sym].actualKeysFiles[keysFilePath] = {};
        // _wf(sym, keysFilePath, {}, "keysFile");
        (0, saveKeysFile_1.saveKeysFile)(sym, keysFilePath);
        (0, getKeysFiles_1.getKeysFiles)(sym);
        keysFile = __1.i.splitterData[sym].keysFiles[keysFilePath]();
        isFirst = isNew = true;
    }
    let lastFileNum = parseInt(keysFilePath.replace(/.+keys(?=\d+\.json$)/, "").replace(/\.json$/, ""));
    if (!keysFile)
        keysFile = __1.i.splitterData[sym].keysFiles[keysFilePath]?.() ?? {};
    if (!isFirst &&
        !isNew &&
        (alwaysNew ||
            (0, checkSize_1.checkSize)(sym, keysFile, chunk, __1.i.splitterData[sym]._options.maxKeysFileSize ?? jsonsplitter_1.defaultKeysFileSize))) {
        (0, saveKeysFile_1.saveKeysFile)(sym, keysFilePath);
        lastFileNum++;
        keysFilePath = (0, parseKeysFilePath_1.parseKeysFilePath)(mainFilePath, `keys${lastFileNum}.json`);
        __1.i.splitterData[sym].actualKeysFiles[keysFilePath] = {};
        (0, saveKeysFile_1.saveKeysFile)(sym, keysFilePath);
        // _wf(sym, keysFilePath, JSON.stringify({}));
        (0, getKeysFiles_1.getKeysFiles)(sym);
        keysFile = __1.i.splitterData[sym].keysFiles[keysFilePath]();
        isNew = true;
    }
    // let newFile = concatJSON([keysFile, addKeysToObject({}, "keys", chunk)]);
    // let newFile = keysFile;
    // chunk.split(";").forEach((a) => {
    //   newFile = addKeysToObject(
    //     keysFile,
    //     ["keys", a.split(",")[0]],
    //     a.split(",")[1]
    //   );
    // });
    let newFile = keysFile;
    if (isNew)
        newFile = chunk;
    else
        newFile = (0, oberknecht_utils_1.concatJSON)([newFile, chunk]);
    (0, oberknecht_utils_1.addKeysToObject)(newFile, ["hasChanges"], true);
    __1.i.splitterData[sym].actualKeysFiles[keysFilePath] = newFile;
    // saveKeysFile(sym, keysFilePath);
    return newFile;
}
