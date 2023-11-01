"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getKeysFiles = void 0;
const __1 = require("..");
const _rf_1 = require("./_rf");
const getKeysPaths_1 = require("./getKeysPaths");
function getKeysFiles(sym) {
    let keysPaths = (0, getKeysPaths_1.getKeysPaths)(sym);
    let keysFiles = {};
    Object.keys(keysPaths).forEach((dir) => {
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
exports.getKeysFiles = getKeysFiles;
