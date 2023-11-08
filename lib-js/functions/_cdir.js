"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports._cdir = void 0;
const _mainpath_1 = require("./_mainpath");
const fs_1 = __importDefault(require("fs"));
const uncorrectPath_1 = require("./uncorrectPath");
const debugLog_1 = require("./debugLog");
function _cdir(sym, cpath) {
    (0, debugLog_1.debugLog)(sym, "_cdir", ...arguments);
    if (!cpath)
        return new Error("cpath is undefined");
    if (!cpath.startsWith((0, _mainpath_1._mainpath)(sym)))
        cpath = (0, _mainpath_1._mainpath)(sym, cpath);
    cpath = (0, uncorrectPath_1.uncorrectpath)(cpath);
    fs_1.default.mkdirSync(cpath, { recursive: true });
    return "lol";
}
exports._cdir = _cdir;
