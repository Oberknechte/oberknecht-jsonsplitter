"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMainFiles = void 0;
const __1 = require("..");
const _rf_1 = require("./_rf");
const getKeysForMainFile_1 = require("./getKeysForMainFile");
const getMainPaths_1 = require("./getMainPaths");
const moveToKeysFiles_1 = require("./moveToKeysFiles");
function getMainFiles(sym) {
    let mainPaths = (0, getMainPaths_1.getMainPaths)(sym);
    let mainFiles = {};
    Object.keys(mainPaths).forEach((mainFilePath) => {
        mainFiles[mainFilePath] = () => {
            if (!__1.i.splitterData[sym]?.actualMainFiles?.[mainFilePath]) {
                let file = (0, _rf_1._rf)(sym, mainFilePath, true);
                let mainFileData = { ...file, lastUsed: Date.now() };
                if (mainFileData.keys)
                    (0, moveToKeysFiles_1.moveToKeysFiles)(sym, mainFilePath);
                mainFileData.keysMoved = true;
                mainFileData.keys = (0, getKeysForMainFile_1.getKeysForMainFile)(sym, mainFilePath);
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
