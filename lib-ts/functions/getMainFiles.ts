import { i } from "..";
import { _rf } from "./_rf";
import { debugLog } from "./debugLog";
import { getKeysForMainFile } from "./getKeysForMainFile";
import { getMainPaths } from "./getMainPaths";
import { moveToKeysFiles } from "./moveToKeysFiles";

export function getMainFiles(sym: string) {
  debugLog(sym, "getMainFiles", ...arguments);
  let mainPaths = getMainPaths(sym);

  let mainFiles = {};

  Object.keys(mainPaths).forEach((mainFilePath) => {
    mainFiles[mainFilePath] = () => {
      if (!i.splitterData[sym]?.actualMainFiles?.[mainFilePath]) {
        let file = _rf(sym, mainFilePath, true);
        let mainFileData = { ...file, lastUsed: Date.now() };
        if (mainFileData.keys && !i.splitterData[sym]._options.noAutoMove) moveToKeysFiles(sym, mainFilePath);

        mainFileData.keysMoved = true;
        mainFileData.keys = getKeysForMainFile(sym, mainFilePath);
        // Object.defineProperty(mainFileData, "keys", {
        //   get() {
        //     return getKeysForMainFile(sym, mainFilePath);
        //   },
        // });
        i.splitterData[sym].actualMainFiles[mainFilePath] = mainFileData;
        return i.splitterData[sym].actualMainFiles[mainFilePath];
      }

      return i.splitterData[sym].actualMainFiles[mainFilePath];
    };
  });

  i.splitterData[sym].mainFiles = mainFiles;

  return mainFiles;
}
