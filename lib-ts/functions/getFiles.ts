import { i } from "..";
import { _rf } from "./_rf";
import { debugLog } from "./debugLog";
import { getPaths } from "./getPaths";

export function getFiles(sym: string) {
  debugLog(sym, "getFiles", ...arguments);
  let paths = getPaths(sym);

  let files = {};

  Object.keys(paths).map((dir) => {
    files[dir] = () => {
      if (!i.splitterData[sym]?.actualFiles?.[dir]) {
        let file = _rf(sym, dir, true);
        let file_ = { ...file, lastUsed: Date.now() };
        i.splitterData[sym].actualFiles[dir] = file_;
        return file_;
      }

      return i.splitterData[sym].actualFiles[dir];
    };
  });

  i.splitterData[sym].files = files;

  return files;
}
