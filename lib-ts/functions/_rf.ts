import { i } from "..";
import { _mainpath } from "./_mainpath";
import { _wf } from "./_wf";
import { clearCacheBySize } from "./clearCacheBySize";
import { correctpath } from "./correctpath";
import { debugLog } from "./debugLog";
import { joinCacheKeyPath } from "./joinCacheKeyPath";
import { uncorrectpath } from "./uncorrectPath";
import fs from "fs";

export function _rf(sym: string, rfpath: string, parse_json?: boolean) {
  debugLog(sym, "_rf", ...arguments);
  if (!rfpath) return new Error(`_rf: rfpath is undefined`);
  let rfpath_ = uncorrectpath(_mainpath(sym, rfpath));

  try {
    if (fs.existsSync(rfpath_)) {
      let file = fs.readFileSync(rfpath_, "utf-8");
      // let fileData = fs.statSync(rfpath_);

      if (rfpath.endsWith(".json") && parse_json) {
        if (
          typeof file === "string" &&
          typeof JSON.parse(file) === "object" &&
          Object.keys(file).length > 0
        ) {
          if (sym) {
            let file_ = JSON.parse(file);
            let file_2 = {
              ...file_,
              lastUsed: Date.now(),
            };

            if (!rfpath.endsWith("_main.json")) {
              if (!i.splitterData[sym].actualFiles)
                i.splitterData[sym].actualFiles = {};
              i.splitterData[sym].actualFiles[correctpath(rfpath)] = file_2;
              // i.cache.set(
              //   joinCacheKeyPath(["actualFiles", correctpath(rfpath)]),
              //   file_2
              // );
            } else if (rfpath.endsWith("_main.json")) {
              if (!i.splitterData[sym].actualMainFiles)
                i.splitterData[sym].actualMainFiles = {};
              i.splitterData[sym].actualMainFiles[correctpath(rfpath)] = file_2;
              // i.cache.set(
              //   joinCacheKeyPath(["actualMainFiles", correctpath(rfpath)]),
              //   file_2
              // );
            }

            return file_2;
          }

          return file;
        } else {
          if (file.length === 0) _wf(sym, rfpath, {});
          return {};
        }
      } else {
        return file;
      }
    } else {
      return new Error(`_rf: File does not exist\nPath: ${rfpath_}`);
    }
  } catch (e) {
    return new Error(`_rf: Could not read file\n${e}`);
  }
}
