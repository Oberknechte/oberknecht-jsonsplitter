"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFiles = getFiles;
const __1 = require("..");
const _rf_1 = require("./_rf");
const debugLog_1 = require("./debugLog");
const getPaths_1 = require("./getPaths");
function getFiles(sym) {
    (0, debugLog_1.debugLog)(sym, "getFiles", ...arguments);
    let paths = (0, getPaths_1.getPaths)(sym);
    let files = {};
    Object.keys(paths).map((dir) => {
        files[dir] = () => {
            if (!__1.i.splitterData[sym]?.actualFiles?.[dir]) {
                let file = (0, _rf_1._rf)(sym, dir, true);
                let file_ = { ...file, lastUsed: Date.now() };
                __1.i.splitterData[sym].actualFiles[dir] = file_;
                return file_;
            }
            return __1.i.splitterData[sym].actualFiles[dir];
        };
    });
    __1.i.splitterData[sym].files = files;
    return files;
}
