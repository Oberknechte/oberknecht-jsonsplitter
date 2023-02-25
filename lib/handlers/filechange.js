let i = require("..");
const _wf = require("../functions/_wf");

module.exports = (sym, interval) => {
    function filechange() {
        // console.log("filechange");
        if(!i.splitterData[sym]?.files) return;
        Object.keys(i.splitterData[sym].mainfiles).forEach(mainfilepath => {
            if((i.splitterData[sym].mainfiles[mainfilepath].hasChanges ?? []).length == 0) return;
    
            i.splitterData[sym].mainfiles[mainfilepath].hasChanges.forEach(filepath => {
                i.splitterData[sym].mainfiles[mainfilepath].hasChanges.splice(i.splitterData[sym].mainfiles[mainfilepath].hasChanges.indexOf(filepath), 1);

                _wf(sym, filepath, i.splitterData[sym].files[filepath]);
            });

            _wf(sym, mainfilepath, i.splitterData[sym].mainfiles[mainfilepath]);
        });
    };

    filechange();
    setInterval(filechange, interval);
};