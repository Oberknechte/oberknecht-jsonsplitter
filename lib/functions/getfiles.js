let i = require("..");
const getpaths = require("./getpaths");
const _rf = require("./_rf");

/** @param {Symbol} sym */
function getfiles(sym) {
    let paths = getpaths(sym);

    let files = {};

    Object.keys(paths).forEach(dir => {
        files[dir] = _rf(sym, dir, true);
    });

    i.splitterData[sym].files = files;

    return files;
};

module.exports = getfiles;