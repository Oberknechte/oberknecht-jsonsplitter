import { _mainpath } from "./_mainpath";
import fs from "fs";
import { uncorrectpath } from "./uncorrectPath";
import { debugLog } from "./debugLog";

export function _cdir(sym: string, cpath: string) {
  debugLog(sym, "_cdir", ...arguments);
  if (!cpath) return new Error("cpath is undefined");

  if (!cpath.startsWith(_mainpath(sym))) cpath = _mainpath(sym, cpath);
  cpath = uncorrectpath(cpath);

  fs.mkdirSync(cpath, { recursive: true });

  return "lol";
}
