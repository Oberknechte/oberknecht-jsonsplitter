const fs = require("fs");
const i = require("..");
const _mainpath = require("./_mainpath");
const _rf = require("./_rf");
const path = require("path");
const correctpath = require("./correctpath");

/** @param {Symbol} sym @param {string} wfpath @param {string | object} wffile */
function _wf(sym, wfpath, wffile) {
    if (!wfpath) return new Error(`_wf: wfpath is undefined`);
    if (!wffile) return new Error(`_wf: wffile is undefined`);

    if (!wfpath.startsWith(_mainpath(sym))) wfpath = _mainpath(sym, wfpath);
    wfpath = correctpath(wfpath);

    if (sym && wfpath.endsWith("_main.json")) {
        if (!i.splitterData[sym].actualMainFiles) i.splitterData[sym].actualMainFiles = {};
        i.splitterData[sym].actualMainFiles[wfpath] = wffile;

        if (!i.splitterData[sym].mainFiles[wfpath]) {
            i.splitterData[sym].mainFiles[wfpath] = () => {
                if (!i.splitterData[sym].actualMainFiles[wfpath]) {
                    let file = _rf(sym, wfpath, true);
                    let file_ = { ...file, lastUsed: Date.now() };
                    i.splitterData[sym].actualMainFiles[wfpath] = file_;
                    return file_;
                };

                return i.splitterData[sym].actualMainFiles[wfpath];
            };
        }
    } else {
        if (!i.splitterData[sym].actualFiles) i.splitterData[sym].actualFiles = {};
        i.splitterData[sym].actualFiles[wfpath] = wffile;

        if (!i.splitterData[sym].files[wfpath]) {
            i.splitterData[sym].files[wfpath] = () => {
                if (!i.splitterData[sym].actualFiles[wfpath]) {
                    let file = _rf(sym, wfpath, true);
                    let file_ = { ...file, lastUsed: Date.now() };
                    i.splitterData[sym].actualFiles[wfpath] = file_;
                    return file_;
                };

                return i.splitterData[sym].actualFiles[wfpath];
            };
        }
    }

    try {
        switch (typeof wffile) {
            case "string": {
                fs.writeFileSync(wfpath, wffile, "utf-8");
                break;
            };

            case "object": {
                let file_ = { ...wffile };
                if (file_.lastUsed) file_.lastUsed;
                fs.writeFileSync(wfpath, JSON.stringify(file_), "utf-8");
                break;
            };

            default: {
                return new Error(`_wf: typeof wffile is ${typeof (wffile)} (expected string or object)`);
            };
        }
    } catch (e) {
        return new Error(`_wf: Could not write file\n${e}`);
    }
};

module.exports = _wf;