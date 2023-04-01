const _mainpath = require("./_mainpath");
const fs = require("fs");
const path = require("path");

/** @param {Symbol} sym @param {string} cpath */
function _cdir(sym, cpath) {
    if (!cpath) return new Error("cpath is undefined");

    if (!cpath.startsWith(_mainpath(sym))) cpath = _mainpath(sym, cpath);
    cpath = cpath.replace(/\//g, path.sep);

    fs.mkdirSync(cpath, { recursive: true });

    return "lol";
};

module.exports = _cdir;