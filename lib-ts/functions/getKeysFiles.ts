import { i } from "..";
import { _rf } from "./_rf";
import { debugLog } from "./debugLog";
import { getKeysPaths } from "./getKeysPaths";

export function getKeysFiles(sym: string) {
  debugLog(sym, "getKeysFiles", ...arguments);
  let keysPaths = getKeysPaths(sym);

  let keysFiles = {};

  Object.keys(keysPaths).forEach((dir) => {
    keysFiles[dir] = () => {
      if (i.splitterData[sym]?.actualKeysFiles?.[dir])
        return i.splitterData[sym].actualKeysFiles[dir];

      let file = _rf(sym, dir, true);
      i.splitterData[sym].actualKeysFiles[dir] = {
        ...file,
        lastUsed: Date.now(),
      };
      return file;
    };
  });

  i.splitterData[sym].keysFiles = keysFiles;

  return keysFiles;
}
