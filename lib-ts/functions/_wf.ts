import { correctpath } from "./correctpath";
import { _rf } from "./_rf";
import { _mainpath } from "./_mainpath";
import fs from "fs";
import { i } from "..";

export function _wf(
  sym: string,
  wfpath: string,
  wffile: string | object | Buffer
) {
  if (!wfpath) return new Error(`_wf: wfpath is undefined`);
  if (!wffile) return new Error(`_wf: wffile is undefined`);

  if (!wfpath.startsWith(_mainpath(sym))) wfpath = _mainpath(sym, wfpath);
  wfpath = correctpath(wfpath);

  if (sym && wfpath.endsWith("_main.json")) {
    if (!i.splitterData[sym].actualMainFiles)
      i.splitterData[sym].actualMainFiles = {};
    i.splitterData[sym].actualMainFiles[wfpath] = wffile;

    if (!i.splitterData[sym].mainFiles[wfpath]) {
      i.splitterData[sym].mainFiles[wfpath] = () => {
        if (!i.splitterData[sym].actualMainFiles[wfpath]) {
          let file = _rf(sym, wfpath, true);
          let file_ = { ...file, lastUsed: Date.now() };
          i.splitterData[sym].actualMainFiles[wfpath] = file_;
          return file_;
        }

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
        }

        return i.splitterData[sym].actualFiles[wfpath];
      };
    }
  }

  try {
    switch (typeof wffile) {
      case "string": {
        fs.writeFileSync(wfpath, wffile, "utf-8");
        break;
      }

      case "object": {
        let file_: Record<string, any> = { ...wffile };
        if (file_.lastUsed) file_.lastUsed;
        fs.writeFileSync(wfpath, JSON.stringify(file_), "utf-8");
        break;
      }

      default: {
        return new Error(
          `_wf: typeof wffile is ${typeof wffile} (expected string or object)`
        );
      }
    }
  } catch (e) {
    return new Error(`_wf: Could not write file\n${e}`);
  }
}
