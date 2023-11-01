import { addAppendKeysToObject } from "oberknecht-utils";
import { i } from "..";
import { getKeysFiles } from "./getKeysFiles";

export function getKeysForMainFile(sym: string, mainFilePath: string) {
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
      addAppendKeysToObject(keys, [], keysFile.keys);
    });

  return keys;
}
