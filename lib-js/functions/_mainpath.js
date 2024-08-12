"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports._mainpath = _mainpath;
const path_1 = __importDefault(require("path"));
const __1 = require("..");
const correctpath_1 = require("./correctpath");
const debugLog_1 = require("./debugLog");
function _mainpath(sym, path_) {
    (0, debugLog_1.debugLog)(sym, "_mainpath", ...arguments);
    let defaultdir = __1.i.splitterData[sym]?._options?.startpath ?? process.cwd();
    if (!sym && !path_)
        return (0, correctpath_1.correctpath)(defaultdir);
    if (/^jsonsplitter-/.test(sym) && !path_)
        return (0, correctpath_1.correctpath)(path_1.default.resolve(__1.i.splitterData[sym]?._options?.startpath ?? defaultdir));
    if (sym && !path_)
        return (0, correctpath_1.correctpath)(path_1.default.resolve(__1.i.splitterData?.[sym]?._options?.startpath ?? defaultdir, ...(Array.isArray(sym) ? sym : [sym])));
    if (!path_ || path_.length === 0)
        return (0, correctpath_1.correctpath)(__1.i.splitterData?.[sym]?._options?.startpath ?? defaultdir);
    if (!Array.isArray(path_))
        path_ = [path_];
    if (__1.i.splitterData[sym]?._options?.startpath) {
        let sp = __1.i.splitterData[sym]._options.startpath;
        if (!path_[0] == sp)
            path_.unshift(sp);
    }
    return (0, correctpath_1.correctpath)(path_1.default.resolve(defaultdir, ...path_));
}
