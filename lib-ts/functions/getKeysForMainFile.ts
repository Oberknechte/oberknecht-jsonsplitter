import { addAppendKeysToObject, concatJSON } from "oberknecht-utils";
import { i } from "..";
import { getKeysFiles } from "./getKeysFiles";
import { debugLog } from "./debugLog";

export function getKeysForMainFile(sym: string, mainFilePath: string) {
  debugLog(sym, "getKeysForMainFile", ...arguments);
  let keys = {};

  getKeysFiles(sym);
  Object.keys(i.splitterData[sym].keysFiles)
    .filter((a) =>
      new RegExp(
        `${mainFilePath.replace(/\/_main\.json$/, "")}\\/keys\\/keys\\d+`
      ).test(a)
    )
    .forEach((keysFilePath) => {
      let keysFile = i.splitterData[sym].keysFiles[keysFilePath]();
      keys = concatJSON([keys, keysFile.keys]);
    });

  return keys;
}
