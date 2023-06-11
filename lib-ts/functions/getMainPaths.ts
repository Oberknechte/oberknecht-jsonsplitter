import path from "path";
import { i } from "..";
import fs from "fs";
import { _mainpath } from "./_mainpath";
import { correctpath } from "./correctpath";

export function getMainPaths(sym: string) {
  let mainPaths = {};
  
  function rd(dirpath: string) {
    let dir = fs.readdirSync(dirpath, { withFileTypes: true });

    let mains = dir.filter((a) => a.name == "_main.json");
    if (mains.length > 0)
      mainPaths[correctpath(path.resolve(dirpath, mains[0].name))] = path
        .resolve(dirpath, mains[0].name)
        .replace(_mainpath(sym), "")
        .replace(/^\/|\/$/g, "");
    dir
      .filter((a) => a.isDirectory())
      .forEach((dir_) => {
        rd(path.resolve(dirpath, dir_.name));
      });
  }

  rd(i.splitterData[sym]._options.startpath);

  i.splitterData[sym].mainPaths = mainPaths;

  return mainPaths;
}
