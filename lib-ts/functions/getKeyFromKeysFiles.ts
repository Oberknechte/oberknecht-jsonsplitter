import { getKeyFromObject, isNullUndefined } from "oberknecht-utils";
import { i } from "..";

type getKeyFromKeysFileReturnExtended = {
  value?: number;
  keysFilePath?: string;
};

type getKeyFromKeysFileReturn = number;

// : withKeysFilePathType extends true ? getKeyFromKeysFileReturnExtended | {} : getKeyFromKeysFileReturn | undefined

export function getKeyFromKeysFiles<withKeysFilePathType extends Boolean>(
  sym: string,
  key: string,
  withKeysFilePath?: withKeysFilePathType | undefined
) {
  let val;
  let keysFilePath;

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

  searchFile(Object.keys(i.splitterData[sym].keysFiles), 0);
  return withKeysFilePath
    ? {
        value: val,
        keysFilePath: keysFilePath,
      }
    : val;
}
