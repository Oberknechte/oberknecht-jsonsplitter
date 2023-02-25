let i = require("..");
const getmainpaths = require("./getmainpaths");
const _rf = require("./_rf");

/** @param {Symbol} sym */
function getmainfiles(sym) {
    let mainpaths = getmainpaths(sym);

    let mainfiles = {};

    Object.keys(mainpaths).forEach(dir => {
        mainfiles[dir] = _rf(sym, dir, true);
    });

    i.splitterData[sym].mainfiles = mainfiles;

    return mainfiles;
};

module.exports = getmainfiles;