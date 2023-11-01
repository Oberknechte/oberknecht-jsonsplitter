import { addKeysToObject, deleteKeyFromObject } from "oberknecht-utils";
import { getKeyFromKeysFiles } from "./getKeyFromKeysFiles";
import { i } from "..";

export function removeKeyFromKeysFile(sym: string, key: string) {
  let keyData = getKeyFromKeysFiles(sym, key, true);
  if (!keyData.keysFilePath) return;
  let keysFilePath = keyData.keysFilePath;
  let keysFile = i.splitterData[sym].actualKeysFile;

  let newFile = deleteKeyFromObject(keysFile, ["keys", key]);
  addKeysToObject(newFile, ["hasChanges"], true);
  i.splitterData[sym].actualKeysFiles[keysFilePath] = newFile;
}
