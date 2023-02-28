let i = require("..");
const _log = require("../functions/_log");
const _wf = require("../functions/_wf");

module.exports = (sym, interval) => {
    function filechange() {
        let changed_files = 0;
        if(i.splitterData[sym]._options?.debug >= 2) _log(0, `[JSONSPLITTER] [FILECHANGE] Executed`);
        if(!i.splitterData[sym]?.files) return;
        Object.keys(i.splitterData[sym].mainfiles).forEach(mainfilepath => {
            if((i.splitterData[sym].mainfiles[mainfilepath].hasChanges ?? []).length == 0) return;
    
            i.splitterData[sym].mainfiles[mainfilepath].hasChanges.forEach(filepath => {
                changed_files++;
                i.splitterData[sym].mainfiles[mainfilepath].hasChanges.splice(i.splitterData[sym].mainfiles[mainfilepath].hasChanges.indexOf(filepath), 1);

                _wf(sym, filepath, i.splitterData[sym].files[filepath]);
            });

            _wf(sym, mainfilepath, i.splitterData[sym].mainfiles[mainfilepath]);
        });

        if(i.splitterData[sym]._options?.debug >= 2) _log(0, `[JSONSPLITTER] [FILECHANGE] Changed ${changed_files} files`);
    };

    filechange();

    i.splitterData[sym].filechangeInterval = setInterval(filechange, interval);
};