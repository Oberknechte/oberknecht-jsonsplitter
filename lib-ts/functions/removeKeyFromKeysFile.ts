import {
  addKeysToObject,
  convertToArray,
  deleteKeyFromObject,
  getKeyFromObject,
} from "oberknecht-utils";
import { getKeyFromKeysFiles } from "./getKeyFromKeysFiles";
import { i } from "..";
import { debugLog } from "./debugLog";

export function removeKeyFromKeysFile(sym: string, keypath: string | string[]) {
  debugLog(sym, "removeKeyFromKeysFile", ...arguments);
  let keypath_ = convertToArray(keypath);
  let key = keypath_[i.splitterData[sym]._options.child_folders_keys];
  let keyData = getKeyFromKeysFiles(sym, keypath, true);
  if (!keyData.keysFilePath) return;
  let keysFilePath = keyData.keysFilePath;
  let keysFile = i.splitterData[sym].actualKeysFile;

  if (!getKeyFromObject(keysFile, ["keys", key])) return;
  let newFile = deleteKeyFromObject(keysFile, ["keys", key]);
  addKeysToObject(newFile, ["hasChanges"], true);
  i.splitterData[sym].actualKeysFiles[keysFilePath] = newFile;
}
