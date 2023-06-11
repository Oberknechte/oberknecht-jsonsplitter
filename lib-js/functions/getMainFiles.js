"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMainFiles = void 0;
const __1 = require("..");
const _rf_1 = require("./_rf");
const getMainPaths_1 = require("./getMainPaths");
function getMainFiles(sym) {
    let mainPaths = (0, getMainPaths_1.getMainPaths)(sym);
    let mainFiles = {};
    Object.keys(mainPaths).forEach(dir => {
        mainFiles[dir] = () => {
            if (!__1.i.splitterData[sym]?.actualMainFiles?.[dir]) {
                let file = (0, _rf_1._rf)(sym, dir, true);
                __1.i.splitterData[sym].actualMainFiles[dir] = { ...file, lastUsed: Date.now() };
                return file;
            }
            ;
            return __1.i.splitterData[sym].actualMainFiles[dir];
        };
    });
    __1.i.splitterData[sym].mainFiles = mainFiles;
    return mainFiles;
}
exports.getMainFiles = getMainFiles;
;
