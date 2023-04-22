let i = require("..");
const getpaths = require("./getpaths");
const _rf = require("./_rf");

/** @param {Symbol} sym */
function getfiles(sym) {
    let paths = getpaths(sym);

    let files = {};

    Object.keys(paths).map(dir => {
        files[dir] = () => {
            if (!i.splitterData[sym]?.actualFiles?.[dir]) {
                let file = _rf(sym, dir, true);
                let file_ = { ...file, lastUsed: Date.now() };
                i.splitterData[sym].actualFiles[dir] = file_;
                return file_;
            };

            return i.splitterData[sym].actualFiles[dir];
        };
    });

    i.splitterData[sym].files = files;

    return files;
};

module.exports = getfiles;