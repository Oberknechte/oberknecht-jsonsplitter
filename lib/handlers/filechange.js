let i = require("..");
const _log = require("../functions/_log");
const _wf = require("../functions/_wf");

function filechange(sym) {
    let changed_files = 0;
    if (i.splitterData[sym]._options?.debug >= 2) _log(0, `[JSONSPLITTER] [FILECHANGE] Executed`);
    if (!i.splitterData[sym]?.actualFiles) return;
    Object.keys(i.splitterData[sym].actualMainFiles).forEach(mainfilepath => {
        let mainFile = i.splitterData[sym].actualMainFiles[mainfilepath];
        if ((mainFile.hasChanges ?? []).length == 0) return;

        mainFile.hasChanges.forEach(filepath => {
            changed_files++;
            mainFile.hasChanges.splice(mainFile.hasChanges.indexOf(filepath), 1);

            let file = i.splitterData[sym].actualFiles[filepath];
            delete file.lastUsed;
            _wf(sym, filepath, file);
        });

        delete mainFile.lastUsed;
        _wf(sym, mainfilepath, mainFile);
    });

    if (i.splitterData[sym]._options?.debug >= 2) _log(0, `[JSONSPLITTER] [FILECHANGE] Changed ${changed_files} files`);
};

module.exports = filechange;