import { _rf } from "./_rf";
import { _mainpath } from "./_mainpath";
import fs from "fs";
import { i } from "..";
import { debugLog } from "./debugLog";
import { uncorrectpath } from "./uncorrectPath";

export function _wf(
  sym: string,
  wfpath: string,
  wffile: string | object | Buffer,
  fileType?: string
) {
  debugLog(sym, "_wf", ...arguments);
  if (!wfpath) return new Error(`_wf: wfpath is undefined`);
  if (!wffile) return new Error(`_wf: wffile is undefined`);

  if (!wfpath.startsWith(_mainpath(sym))) wfpath = _mainpath(sym, wfpath);
  let wfpath_ = uncorrectpath(wfpath);
  let wfpathMove = uncorrectpath(wfpath) + ".jsmove";
  let wfpathOld = uncorrectpath(wfpath) + ".jsold";

  if (
    sym &&
    wfpath.endsWith("_main.json") &&
    (!fileType || fileType === "main")
  ) {
    if (!i.splitterData[sym].actualMainFiles)
      i.splitterData[sym].actualMainFiles = {};
    i.splitterData[sym].actualMainFiles[wfpath] = wffile;

    if (!i.splitterData[sym].mainFiles[wfpath]) {
      i.splitterData[sym].mainFiles[wfpath] = () => {
        if (!i.splitterData[sym].actualMainFiles[wfpath]) {
          let file = _rf(sym, wfpath_, true);
          let file_ = { ...file, lastUsed: Date.now() };
          i.splitterData[sym].actualMainFiles[wfpath] = file_;
          return file_;
        }

        return i.splitterData[sym].actualMainFiles[wfpath];
      };
    }
  } else {
    if (!fileType || fileType === "file") {
      if (!i.splitterData[sym].actualFiles)
        i.splitterData[sym].actualFiles = {};
      i.splitterData[sym].actualFiles[wfpath] = wffile;

      if (!i.splitterData[sym].files[wfpath]) {
        i.splitterData[sym].files[wfpath] = () => {
          if (!i.splitterData[sym].actualFiles[wfpath]) {
            let file = _rf(sym, wfpath_, true);
            let file_ = { ...file, lastUsed: Date.now() };
            i.splitterData[sym].actualFiles[wfpath] = file_;
            return file_;
          }

          return i.splitterData[sym].actualFiles[wfpath];
        };
      }
    }
  }

  let wfpathdir = wfpath.split("/").slice(0, -1).join("/");
  let wfpathdir_ = uncorrectpath(wfpathdir);
  if (!fs.existsSync(wfpathdir_))
    fs.mkdirSync(wfpathdir_, {
      recursive: true,
    });

  try {
    switch (typeof wffile) {
      case "string": {
        fs.writeFileSync(wfpath_, wffile, "utf-8");
        break;
      }

      case "object": {
        let file_: Record<string, any> = { ...wffile };
        // if (file_.lastUsed) file_.lastUsed;
        // if (fs.existsSync(wfpath_)) {
        //   if (fs.existsSync(wfpath_)) fs.renameSync(wfpath_, wfpathOld);
        //   fs.renameSync(wfpathMove, wfpath_);
        //   fs.rmSync(wfpathOld);
        // } else {
        // }
        fs.writeFileSync(wfpath_, JSON.stringify(file_), "utf-8");
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
