const path = require("path");
const i = require("..");
const correctpath = require("./correctpath");

/** @param {Symbol} sym @param {Array | string} path_ */
function _mainpath(sym, path_) {
    let defaultdir = (i.splitterData[sym]?._options?.startpath ?? process.cwd());
    if ((!sym) && !path_) return correctpath(defaultdir);
    if (typeof sym === "symbol" && !path_) return correctpath(path.resolve(i.splitterData[sym]?._options?.startpath ?? defaultdir));
    if (sym && !path_) return correctpath(path.resolve((i.splitterData?.[sym]?._options?.startpath ?? defaultdir), ...(Array.isArray(sym) ? sym : [sym])));
    if (!path_ || path_.length === 0) return correctpath(i.splitterData?.[sym]?._options?.startpath ?? defaultdir);
    if (!Array.isArray(path_)) path_ = [path_];

    if (i.splitterData[sym]?._options?.startpath) {
        let sp = i.splitterData[sym]._options.startpath;
        if (!path_[0] == sp) path_.unshift(sp);
    }

    return correctpath(path.resolve((i.splitterData?.[sym]?._options?.startpath ?? defaultdir), ...path_));
};

module.exports = _mainpath;