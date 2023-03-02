let i = require("..");
const getmainpaths = require("./getmainpaths");
const _rf = require("./_rf");

/** @param {Symbol} sym */
function getmainfiles(sym) {
    let mainpaths = getmainpaths(sym);

    let mainfiles = {};

    Object.keys(mainpaths).forEach(dir => {
        mainfiles[dir] = () => {
            if (!i.splitterData[sym]?.actualMainFiles?.[dir]) {
                let file = _rf(sym, dir, true);
                i.splitterData[sym].actualMainFiles[dir] = file;
                return file;
            };

            return i.splitterData[sym].actualMainFiles[dir];
        };
    });

    i.splitterData[sym].mainfiles = mainfiles;

    return mainfiles;
};

module.exports = getmainfiles;