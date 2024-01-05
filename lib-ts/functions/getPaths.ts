import path from "path";
import { i } from "..";
import fs from "fs";
import { _mainpath } from "./_mainpath";
import { correctpath } from "./correctpath";
import { debugLog } from "./debugLog";
import { uncorrectpath } from "./uncorrectPath";

export function getPaths(sym: string) {
  debugLog(sym, "getPaths", ...arguments);
  let paths = {};
  function rd(dirpath: string) {
    let dir = fs.readdirSync(dirpath, { withFileTypes: true });
    if (dir === i.splitterData[sym]._options.backupPath) return;

    dir
      .filter((a) => a.isFile() && a.name !== "_main.json")
      .forEach((path_) => {
        paths[correctpath(path.resolve(dirpath, path_.name))] = correctpath(
          path.resolve(dirpath, path_.name)
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

  i.splitterData[sym].paths = paths;

  return paths;
}
