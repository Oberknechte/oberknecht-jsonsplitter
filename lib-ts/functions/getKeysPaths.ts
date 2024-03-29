import path from "path";
import { i } from "..";
import fs from "fs";
import { _mainpath } from "./_mainpath";
import { correctpath } from "./correctpath";
import { debugLog } from "./debugLog";
import { uncorrectpath } from "./uncorrectPath";

export function getKeysPaths(sym: string) {
  debugLog(sym, "getKeysPaths", ...arguments);
  let keysPaths = {};

  function rd(dirpath: string) {
    let dir = fs.readdirSync(dirpath, { withFileTypes: true });

    let keys = dir.filter((a) => /^keys\d+\.json$/.test(a.name));
    if (/\/keys$/.test(correctpath(dirpath)) && keys.length > 0)
      keys.forEach((key) => {
        keysPaths[correctpath(path.resolve(dirpath, key.name))] = correctpath(
          path.resolve(dirpath, key.name)
        )
          .replace(_mainpath(sym), "")
          .replace(/^\/|\/$/g, "");
      });
    dir
      .filter((a) => a.isDirectory())
      .forEach((dir_) => {
        rd(path.resolve(dirpath, dir_.name));
      });
  }

  rd(i.splitterData[sym]._options.startpath);

  i.splitterData[sym].keysPaths = keysPaths;

  return keysPaths;
}
