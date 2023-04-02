let i = require("..");
const getmainpaths = require("./getmainpaths");
const _rf = require("./_rf");
const correctpath = require("./correctpath");

/** @param {Symbol} sym */
function getmainfiles(sym) {
    let mainPaths = getmainpaths(sym);

    let mainFiles = {};

    Object.keys(mainPaths).forEach(dir => {
        mainFiles[correctpath(dir)] = () => {
            if (!i.splitterData[sym]?.actualMainFiles?.[correctpath(dir)]) {
                let file = _rf(sym, dir, true);
                i.splitterData[sym].actualMainFiles[correctpath(dir)] = file;
                return file;
            };

            return i.splitterData[sym].actualMainFiles[correctpath(dir)];
        };
    });

    i.splitterData[sym].mainFiles = mainFiles;

    return mainFiles;
};

module.exports = getmainfiles;