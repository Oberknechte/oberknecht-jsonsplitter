const fs = require("fs");
const i = require("..");
const _mainpath = require("./_mainpath");

/** @param {Symbol} sym @param {string} wfpath @param {string | object} wffile */
function _wf(sym, wfpath, wffile) {
    if (!wfpath) return new Error(`_wf: wfpath is undefined`);
    if (!wffile) return new Error(`_wf: wffile is undefined`);

    if (!wfpath.startsWith(_mainpath(sym))) wfpath = _mainpath(sym, wfpath);

    if (sym && wfpath.endsWith("_main.json")) {
        if (!i.splitterData[sym].mainfiles) i.splitterData[sym].mainfiles = {};

        i.splitterData[sym].mainfiles[wfpath.replace(_mainpath(sym), "").replace(/^\/$/g, "")] = wffile;
    };

    try {
        switch (typeof wffile) {
            case "string": {
                fs.writeFileSync(wfpath, wffile, "utf-8");
                break;
            }

            case "object": {
                if (typeof JSON.stringify(wffile) === "string") {
                    fs.writeFileSync(wfpath, JSON.stringify(wffile), "utf-8");
                } else {
                    return new Error(`_wf: typeof JSON.stringify(wffile) is ${typeof JSON.stringify(wffile)} (expected string)`);
                }

                break;
            }

            default: {
                return new Error(`_wf: typeof wffile is ${typeof (wffile)} (expected string or object)`);
            }
        }
    } catch (e) {
        return new Error(`_wf: Could not write file\n${e}`);
    }
};

module.exports = _wf;