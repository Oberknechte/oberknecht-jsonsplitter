"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fileChange = void 0;
const __1 = require("..");
const _log_1 = require("../functions/_log");
const _wf_1 = require("../functions/_wf");
async function fileChange(sym, auto) {
    return new Promise((resolve) => {
        let changed_files = 0;
        __1.i.oberknechtEmitter[sym].emit("filechange", `${auto ? "[Automatic] " : ""} Executed`);
        if (__1.i.splitterData[sym]._options?.debug >= 2)
            (0, _log_1._log)(0, `[JSONSPLITTER] [FILECHANGE] ${auto ? "[Automatic] " : ""} Executed`);
        if (!__1.i.splitterData[sym]?.actualFiles)
            return;
        Object.keys(__1.i.splitterData[sym].actualMainFiles).forEach((mainfilepath) => {
            let mainFile = __1.i.splitterData[sym].actualMainFiles[mainfilepath];
            if ((mainFile.hasChanges ?? []).length == 0)
                return;
            mainFile.hasChanges.forEach((filepath) => {
                changed_files++;
                mainFile.hasChanges.splice(mainFile.hasChanges.indexOf(filepath), 1);
                let file = __1.i.splitterData[sym].actualFiles[filepath];
                if (file)
                    (0, _wf_1._wf)(sym, filepath, file);
                else
                    delete __1.i.splitterData[sym].actualFiles[filepath];
            });
            if (mainFile.lastUsed)
                delete mainFile.lastUsed;
            (0, _wf_1._wf)(sym, mainfilepath, mainFile);
        });
        __1.i.oberknechtEmitter[sym].emit("filechange", `${auto ? "[Automatic] " : ""}Finished, changed ${changed_files} files`);
        if (__1.i.splitterData[sym]._options?.debug >= 2)
            (0, _log_1._log)(0, `[JSONSPLITTER] [FILECHANGE] ${auto ? "[Automatic] " : ""} Changed ${changed_files} files`);
        resolve();
    });
}
exports.fileChange = fileChange;
