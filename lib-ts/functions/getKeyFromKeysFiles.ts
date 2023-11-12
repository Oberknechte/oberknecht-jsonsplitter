import {
  convertToArray,
  getKeyFromObject,
  isNullUndefined,
} from "oberknecht-utils";
import { i } from "..";
import { debugLog } from "./debugLog";

type getKeyFromKeysFileReturnExtended = {
  value?: number;
  keysFilePath?: string;
};

type getKeyFromKeysFileReturn = number;

// : withKeysFilePathType extends true ? getKeyFromKeysFileReturnExtended | {} : getKeyFromKeysFileReturn | undefined

export function getKeyFromKeysFiles<withKeysFilePathType extends Boolean>(
  sym: string,
  keypath: string | string[],
  withKeysFilePath?: withKeysFilePathType | undefined
) {
  debugLog(sym, "getKeyFromKeysFiles", ...arguments);
  let keypath_ = convertToArray(keypath);
  let val;
  let keysFilePath;
  let key = keypath_[i.splitterData[sym]._options.child_folders_keys];

  function searchFile(files: string[], n: number) {
    let keysFilePath_ = files[n];
    if (!keysFilePath_) return;
    let keysFile = i.splitterData[sym].keysFiles[keysFilePath_]();
    let val_ = getKeyFromObject(keysFile, ["keys", key]);
    if (!isNullUndefined(val_)) {
      val = val_;
      keysFilePath = keysFilePath_;
      return;
    }
    searchFile(files, n + 1);
  }

  let searchKeysFiles = Object.keys(i.splitterData[sym].keysFiles).filter(
    (a) =>
      a
        .replace(i.splitterData[sym]._options.startpath, "")
        .replace(/^\//, "")
        .split(/\/keys\/keys\d+\.json$/)[0]
        .split("/")
        .join("\u0001") ===
      keypath_
        .slice(0, i.splitterData[sym]._options.child_folders_keys)
        .join("\u0001")
  );

  searchFile(searchKeysFiles, 0);
  return withKeysFilePath
    ? {
        value: val,
        keysFilePath: keysFilePath,
      }
    : val;
}
