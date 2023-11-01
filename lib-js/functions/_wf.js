"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports._wf = void 0;
const correctpath_1 = require("./correctpath");
const _rf_1 = require("./_rf");
const _mainpath_1 = require("./_mainpath");
const fs_1 = __importDefault(require("fs"));
const __1 = require("..");
function _wf(sym, wfpath, wffile, fileType) {
    if (!wfpath)
        return new Error(`_wf: wfpath is undefined`);
    if (!wffile)
        return new Error(`_wf: wffile is undefined`);
    if (!wfpath.startsWith((0, _mainpath_1._mainpath)(sym)))
        wfpath = (0, _mainpath_1._mainpath)(sym, wfpath);
    wfpath = (0, correctpath_1.correctpath)(wfpath);
    if (sym &&
        wfpath.endsWith("_main.json") &&
        (!fileType || fileType === "main")) {
        if (!__1.i.splitterData[sym].actualMainFiles)
            __1.i.splitterData[sym].actualMainFiles = {};
        __1.i.splitterData[sym].actualMainFiles[wfpath] = wffile;
        if (!__1.i.splitterData[sym].mainFiles[wfpath]) {
            __1.i.splitterData[sym].mainFiles[wfpath] = () => {
                if (!__1.i.splitterData[sym].actualMainFiles[wfpath]) {
                    let file = (0, _rf_1._rf)(sym, wfpath, true);
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
                        let file = (0, _rf_1._rf)(sym, wfpath, true);
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
    if (!fs_1.default.existsSync(wfpathdir))
        fs_1.default.mkdirSync(wfpathdir, {
            recursive: true,
        });
    try {
        switch (typeof wffile) {
            case "string": {
                fs_1.default.writeFileSync(wfpath, wffile, "utf-8");
                break;
            }
            case "object": {
                let file_ = { ...wffile };
                if (file_.lastUsed)
                    file_.lastUsed;
                fs_1.default.writeFileSync(wfpath, JSON.stringify(file_), "utf-8");
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
exports._wf = _wf;
