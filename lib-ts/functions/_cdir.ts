import { _mainpath } from "./_mainpath";
import fs from "fs";
import { uncorrectpath } from "./uncorrectPath";

export function _cdir(sym: string, cpath: string) {
  if (!cpath) return new Error("cpath is undefined");

  if (!cpath.startsWith(_mainpath(sym))) cpath = _mainpath(sym, cpath);
  cpath = uncorrectpath(cpath);

  fs.mkdirSync(cpath, { recursive: true });

  return "lol";
}
