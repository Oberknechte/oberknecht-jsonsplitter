import {
  addKeysToObject,
  concatJSON,
  convertToArray,
  extendedTypeof,
} from "oberknecht-utils";
import { i } from "..";
import { checkSize } from "./checkSize";
import { defaultKeysFileSize } from "../types/jsonsplitter";
import { parseKeysFilePath } from "./parseKeysFilePath";
import { getKeysFiles } from "./getKeysFiles";
import { _wf } from "./_wf";
import { saveKeysFile } from "./saveKeysFile";
import { debugLog } from "./debugLog";

export function addKeyToFileKeys(
  sym: string,
  mainFilePath: string,
  chunk: string
) {
  debugLog(sym, "addKeyToFileKeys", ...arguments);

  let keysFilePath = Object.keys(i.splitterData[sym].keysFiles)
    .filter(
      (a) => a.replace(/keys\/keys\d+\.json$/, "_main.json") === mainFilePath
    )
    .sort(
      (a, b) =>
        parseInt(a.replace(/.+keys(?=\d+\.json$)/, "").replace(/\.json$/, "")) -
        parseInt(b.replace(/.+keys(?=\d+\.json$)/, "").replace(/\.json$/, ""))
    )
    .at(-1);

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
      chunk,
      i.splitterData[sym]._options.maxKeysFileSize ?? defaultKeysFileSize
    )
  ) {
    saveKeysFile(sym, keysFilePath);
    lastFileNum++;
    keysFilePath = parseKeysFilePath(mainFilePath, `keys${lastFileNum}.json`);
    _wf(sym, keysFilePath, JSON.stringify({}));
    getKeysFiles(sym);
    keysFile = i.splitterData[sym].keysFiles[keysFilePath]();
  }

  // let newFile = concatJSON([keysFile, addKeysToObject({}, "keys", chunk)]);
  let newFile = keysFile;
  chunk.split(";").forEach((a) => {
    newFile = addKeysToObject(
      keysFile,
      ["keys", a.split(",")[0]],
      a.split(",")[1]
    );
  });

  addKeysToObject(newFile, ["hasChanges"], true);
  i.splitterData[sym].actualKeysFiles[keysFilePath] = newFile;
  return newFile;
}
