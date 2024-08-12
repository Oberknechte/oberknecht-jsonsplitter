"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getKeysFiles = getKeysFiles;
const __1 = require("..");
const _rf_1 = require("./_rf");
const debugLog_1 = require("./debugLog");
const getKeysPaths_1 = require("./getKeysPaths");
function getKeysFiles(sym) {
    (0, debugLog_1.debugLog)(sym, "getKeysFiles", ...arguments);
    let keysPaths = (0, getKeysPaths_1.getKeysPaths)(sym);
    let keysFiles = {};
    Object.keys(keysPaths)
        .filter((a) => !__1.i.splitterData[sym]?.keysFile?.[a])
        .forEach((dir) => {
        keysFiles[dir] = () => {
            if (__1.i.splitterData[sym]?.actualKeysFiles?.[dir])
                return __1.i.splitterData[sym].actualKeysFiles[dir];
            let file = (0, _rf_1._rf)(sym, dir, true);
            __1.i.splitterData[sym].actualKeysFiles[dir] = {
                ...file,
                lastUsed: Date.now(),
            };
            return file;
        };
    });
    __1.i.splitterData[sym].keysFiles = keysFiles;
    return keysFiles;
}
