"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports._rf = _rf;
const __1 = require("..");
const _mainpath_1 = require("./_mainpath");
const _wf_1 = require("./_wf");
const correctpath_1 = require("./correctpath");
const debugLog_1 = require("./debugLog");
const uncorrectPath_1 = require("./uncorrectPath");
const fs_1 = __importDefault(require("fs"));
function _rf(sym, rfpath, parse_json) {
    (0, debugLog_1.debugLog)(sym, "_rf", ...arguments);
    if (!rfpath)
        return new Error(`_rf: rfpath is undefined`);
    let rfpath_ = (0, uncorrectPath_1.uncorrectpath)((0, _mainpath_1._mainpath)(sym, rfpath));
    try {
        if (fs_1.default.existsSync(rfpath_)) {
            let file = fs_1.default.readFileSync(rfpath_, "utf-8");
            // let fileData = fs.statSync(rfpath_);
            if (rfpath.endsWith(".json") && parse_json) {
                if (typeof file === "string" &&
                    typeof JSON.parse(file) === "object" &&
                    Object.keys(file).length > 0) {
                    if (sym) {
                        let file_ = JSON.parse(file);
                        let file_2 = {
                            ...file_,
                            lastUsed: Date.now(),
                        };
                        if (!rfpath.endsWith("_main.json")) {
                            if (!__1.i.splitterData[sym].actualFiles)
                                __1.i.splitterData[sym].actualFiles = {};
                            __1.i.splitterData[sym].actualFiles[(0, correctpath_1.correctpath)(rfpath)] = file_2;
                            // i.cache.set(
                            //   joinCacheKeyPath(["actualFiles", correctpath(rfpath)]),
                            //   file_2
                            // );
                        }
                        else if (rfpath.endsWith("_main.json")) {
                            if (!__1.i.splitterData[sym].actualMainFiles)
                                __1.i.splitterData[sym].actualMainFiles = {};
                            __1.i.splitterData[sym].actualMainFiles[(0, correctpath_1.correctpath)(rfpath)] = file_2;
                            // i.cache.set(
                            //   joinCacheKeyPath(["actualMainFiles", correctpath(rfpath)]),
                            //   file_2
                            // );
                        }
                        return file_2;
                    }
                    return file;
                }
                else {
                    if (file.length === 0)
                        (0, _wf_1._wf)(sym, rfpath_, {});
                    return {};
                }
            }
            else {
                return file;
            }
        }
        else {
            return new Error(`_rf: File does not exist\nPath: ${rfpath_}`);
        }
    }
    catch (e) {
        return new Error(`_rf: Could not read file\n${e}`);
    }
}
