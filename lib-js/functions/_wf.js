"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports._wf = _wf;
const _rf_1 = require("./_rf");
const _mainpath_1 = require("./_mainpath");
const fs_1 = __importDefault(require("fs"));
const __1 = require("..");
const debugLog_1 = require("./debugLog");
const uncorrectPath_1 = require("./uncorrectPath");
function _wf(sym, wfpath, wffile, fileType) {
    (0, debugLog_1.debugLog)(sym, "_wf", ...arguments);
    if (!wfpath)
        return new Error(`_wf: wfpath is undefined`);
    if (!wffile)
        return new Error(`_wf: wffile is undefined`);
    if (!wfpath.startsWith((0, _mainpath_1._mainpath)(sym)))
        wfpath = (0, _mainpath_1._mainpath)(sym, wfpath);
    let wfpath_ = (0, uncorrectPath_1.uncorrectpath)(wfpath);
    let wfpathMove = (0, uncorrectPath_1.uncorrectpath)(wfpath) + ".jsmove";
    let wfpathOld = (0, uncorrectPath_1.uncorrectpath)(wfpath) + ".jsold";
    if (sym &&
        wfpath.endsWith("_main.json") &&
        (!fileType || fileType === "main")) {
        if (!__1.i.splitterData[sym].actualMainFiles)
            __1.i.splitterData[sym].actualMainFiles = {};
        __1.i.splitterData[sym].actualMainFiles[wfpath] = wffile;
        if (!__1.i.splitterData[sym].mainFiles[wfpath]) {
            __1.i.splitterData[sym].mainFiles[wfpath] = () => {
                if (!__1.i.splitterData[sym].actualMainFiles[wfpath]) {
                    let file = (0, _rf_1._rf)(sym, wfpath_, true);
                    let file_ = { ...file, lastUsed: Date.now() };
                    __1.i.splitterData[sym].actualMainFiles[wfpath] = file_;
                    return file_;
                }
                return __1.i.splitterData[sym].actualMainFiles[wfpath];
            };
        }
    }
    else {
        if (!fileType || fileType === "file") {
            if (!__1.i.splitterData[sym].actualFiles)
                __1.i.splitterData[sym].actualFiles = {};
            __1.i.splitterData[sym].actualFiles[wfpath] = wffile;
            if (!__1.i.splitterData[sym].files[wfpath]) {
                __1.i.splitterData[sym].files[wfpath] = () => {
                    if (!__1.i.splitterData[sym].actualFiles[wfpath]) {
                        let file = (0, _rf_1._rf)(sym, wfpath_, true);
                        let file_ = { ...file, lastUsed: Date.now() };
                        __1.i.splitterData[sym].actualFiles[wfpath] = file_;
                        return file_;
                    }
                    return __1.i.splitterData[sym].actualFiles[wfpath];
                };
            }
        }
    }
    let wfpathdir = wfpath.split("/").slice(0, -1).join("/");
    let wfpathdir_ = (0, uncorrectPath_1.uncorrectpath)(wfpathdir);
    if (!fs_1.default.existsSync(wfpathdir_))
        fs_1.default.mkdirSync(wfpathdir_, {
            recursive: true,
        });
    try {
        switch (typeof wffile) {
            case "string": {
                fs_1.default.writeFileSync(wfpath_, wffile, "utf-8");
                break;
            }
            case "object": {
                let file_ = { ...wffile };
                // if (file_.lastUsed) file_.lastUsed;
                // if (fs.existsSync(wfpath_)) {
                //   if (fs.existsSync(wfpath_)) fs.renameSync(wfpath_, wfpathOld);
                //   fs.renameSync(wfpathMove, wfpath_);
                //   fs.rmSync(wfpathOld);
                // } else {
                // }
                fs_1.default.writeFileSync(wfpath_, JSON.stringify(file_), "utf-8");
                break;
            }
            default: {
                return new Error(`_wf: typeof wffile is ${typeof wffile} (expected string or object)`);
            }
        }
    }
    catch (e) {
        return new Error(`_wf: Could not write file\n${e}`);
    }
}
