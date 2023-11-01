"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fileChange = void 0;
const oberknecht_utils_1 = require("oberknecht-utils");
const __1 = require("..");
const _log_1 = require("../functions/_log");
const _wf_1 = require("../functions/_wf");
async function fileChange(sym, auto) {
    return new Promise((resolve) => {
        let changed_files = 0;
        __1.i.oberknechtEmitter[sym].emit("filechange", `${auto ? "[Automatic] " : ""} Executed`);
        if (__1.i.splitterData[sym]._options?.debug > 2)
            (0, _log_1._log)(0, `[JSONSPLITTER] [FILECHANGE] ${auto ? "[Automatic] " : ""} Executed`);
        if (!__1.i.splitterData[sym]?.actualFiles)
            return;
        Object.keys(__1.i.splitterData[sym].actualMainFiles).forEach((mainFilePath) => {
            let mainFile = __1.i.splitterData[sym].actualMainFiles[mainFilePath];
            let mainFile_ = { ...mainFile };
            if (mainFile_.keysMoved)
                delete mainFile_.keys;
            if ((mainFile_.hasChanges ?? []).length === 0 && !mainFile_.hasKeyChanges)
                return (0, _wf_1._wf)(sym, mainFilePath, mainFile_, "main");
            oberknecht_utils_1.arrayModifiers
                .removeDuplicates(mainFile_.hasChanges)
                .forEach((filepath) => {
                if (filepath.length === 0 || filepath.endsWith("_main.json"))
                    return;
                changed_files++;
                let file = __1.i.splitterData[sym].actualFiles[filepath];
                if (file)
                    (0, _wf_1._wf)(sym, filepath, file);
                else
                    delete __1.i.splitterData[sym].actualFiles[filepath];
            });
            if (mainFile_.hasKeyChanges)
                delete mainFile_.hasKeyChanges;
            mainFile_.hasChanges = [];
            if (mainFile_.lastUsed)
                delete mainFile_.lastUsed;
            (0, _wf_1._wf)(sym, mainFilePath, mainFile_, "main");
        });
        Object.keys(__1.i.splitterData[sym].actualKeysFiles).forEach((keysFilePath) => {
            let keysFile = __1.i.splitterData[sym].actualKeysFiles[keysFilePath];
            if (!keysFile.hasChanges)
                return;
            delete keysFile.hasChanges;
            (0, _wf_1._wf)(sym, keysFilePath, keysFile);
            changed_files++;
        });
        __1.i.oberknechtEmitter[sym].emit("filechange", `${auto ? "[Automatic] " : ""}Finished, changed ${changed_files} files`);
        if (__1.i.splitterData[sym]._options?.debug > 2)
            (0, _log_1._log)(0, `[JSONSPLITTER] [FILECHANGE] ${auto ? "[Automatic] " : ""} Changed ${changed_files} files`);
        resolve();
    });
}
exports.fileChange = fileChange;
