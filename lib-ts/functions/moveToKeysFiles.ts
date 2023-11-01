import { i } from "..";
import fs from "fs";
import { parseKeysFilePath } from "./parseKeysFilePath";
import { addKeyToFileKeys } from "./addKeyToFileKeys";
import { fileChange } from "../handlers/fileChange";

export function moveToKeysFiles(sym: string, mainFilePath: string) {
  let mainFile = i.splitterData[sym].mainFiles[mainFilePath]?.();

  if (!mainFile?.keys || mainFile.keysMoved) return false;

  let keysFolderPath = parseKeysFilePath(mainFilePath);
  if (!fs.existsSync(keysFolderPath)) fs.mkdirSync(keysFolderPath);

  Object.keys(mainFile.keys).forEach((key) => {
    let val = mainFile.keys[key];
    addKeyToFileKeys(sym, mainFilePath, key, val);
  });

  delete mainFile.keys;
  mainFile.hasKeyChanges = true;
  fileChange(sym, true);

  return true;
}
