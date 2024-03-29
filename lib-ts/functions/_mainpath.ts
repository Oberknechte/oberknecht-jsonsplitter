import path from "path";
import { i } from "..";
import { correctpath } from "./correctpath";
import { debugLog } from "./debugLog";

export function _mainpath(sym: string, path_?: string | string[]) {
  debugLog(sym, "_mainpath", ...arguments);
  let defaultdir = i.splitterData[sym]?._options?.startpath ?? process.cwd();
  if (!sym && !path_) return correctpath(defaultdir);
  if (/^jsonsplitter-/.test(sym) && !path_)
    return correctpath(
      path.resolve(i.splitterData[sym]?._options?.startpath ?? defaultdir)
    );
  if (sym && !path_)
    return correctpath(
      path.resolve(
        i.splitterData?.[sym]?._options?.startpath ?? defaultdir,
        ...(Array.isArray(sym) ? sym : [sym])
      )
    );
  if (!path_ || path_.length === 0)
    return correctpath(
      i.splitterData?.[sym]?._options?.startpath ?? defaultdir
    );
  if (!Array.isArray(path_)) path_ = [path_];

  if (i.splitterData[sym]?._options?.startpath) {
    let sp = i.splitterData[sym]._options.startpath;
    if (!path_[0] == sp) path_.unshift(sp);
  }

  return correctpath(path.resolve(defaultdir, ...path_));
}
