"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMainFiles = void 0;
const __1 = require("..");
const _rf_1 = require("./_rf");
const debugLog_1 = require("./debugLog");
const getMainPaths_1 = require("./getMainPaths");
const moveToKeysFiles_1 = require("./moveToKeysFiles");
function getMainFiles(sym) {
    (0, debugLog_1.debugLog)(sym, "getMainFiles", ...arguments);
    let mainPaths = (0, getMainPaths_1.getMainPaths)(sym);
    let mainFiles = {};
    Object.keys(mainPaths).forEach((mainFilePath) => {
        mainFiles[mainFilePath] = () => {
            if (!__1.i.splitterData[sym]?.actualMainFiles?.[mainFilePath]) {
                let file = (0, _rf_1._rf)(sym, mainFilePath, true);
                let mainFileData = { ...file, lastUsed: Date.now() };
                if (mainFileData.keys && !__1.i.splitterData[sym]._options.noAutoMove)
                    (0, moveToKeysFiles_1.moveToKeysFiles)(sym, mainFilePath);
                mainFileData.keysMoved = true;
                // mainFileData.keys = getKeysForMainFile(sym, mainFilePath);
                // Object.defineProperty(mainFileData, "keys", {
                //   get() {
                //     return getKeysForMainFile(sym, mainFilePath);
                //   },
                // });
                __1.i.splitterData[sym].actualMainFiles[mainFilePath] = mainFileData;
                return __1.i.splitterData[sym].actualMainFiles[mainFilePath];
            }
            return __1.i.splitterData[sym].actualMainFiles[mainFilePath];
        };
    });
    __1.i.splitterData[sym].mainFiles = mainFiles;
    return mainFiles;
}
exports.getMainFiles = getMainFiles;
