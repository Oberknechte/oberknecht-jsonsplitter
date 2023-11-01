import { addKeysToObject } from "oberknecht-utils";
import { i } from "..";
import { checkSize } from "./checkSize";
import { defaultKeysFileSize } from "../types/jsonsplitter";
import { parseKeysFilePath } from "./parseKeysFilePath";
import { getKeysFiles } from "./getKeysFiles";
import { _wf } from "./_wf";
import { saveKeysFile } from "./saveKeysFile";

export function addKeyToFileKeys(
  sym: string,
  mainFilePath: string,
  key: string,
  value: any
) {
  let keysFilePath = Object.keys(i.splitterData[sym].keysFiles).at(-1);
  let keysFile;
  if (!keysFilePath) {
    keysFilePath = parseKeysFilePath(mainFilePath, "keys0.json");
    _wf(sym, keysFilePath, {}, "keysFile");
    getKeysFiles(sym);
    keysFile = i.splitterData[sym].keysFiles[keysFilePath]();
  }

  let lastFileNum = parseInt(
    keysFilePath.replace(/.+keys(?=\d+\.json$)/, "").replace(/\.json$/, "")
  );
  if (!keysFile)
    keysFile = i.splitterData[sym].keysFiles[keysFilePath]?.() ?? {};

  if (
    checkSize(
      sym,
      keysFile,
      addKeysToObject({}, ["keys", key], value),
      i.splitterData[sym]._options.maxKeysFileSize ?? defaultKeysFileSize
    )
  ) {
    saveKeysFile(sym, keysFilePath);
    keysFilePath = parseKeysFilePath(
      mainFilePath,
      `keys${lastFileNum + 1}.json`
    );
    _wf(sym, keysFilePath, JSON.stringify({}));
    getKeysFiles(sym);
    keysFile = i.splitterData[sym].keysFiles[keysFilePath]();
  }

  let newFile = addKeysToObject(keysFile, ["keys", key], value);
  addKeysToObject(newFile, ["hasChanges"], true);
  i.splitterData[sym].actualKeysFiles[keysFilePath] = newFile;

  return newFile;
}
