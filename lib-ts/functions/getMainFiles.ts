import { i } from "..";
import { _rf } from "./_rf";
import { getKeysForMainFile } from "./getKeysForMainFile";
import { getMainPaths } from "./getMainPaths";
import { moveToKeysFiles } from "./moveToKeysFiles";

export function getMainFiles(sym: string) {
  let mainPaths = getMainPaths(sym);

  let mainFiles = {};

  Object.keys(mainPaths).forEach((mainFilePath) => {
    mainFiles[mainFilePath] = () => {
      if (!i.splitterData[sym]?.actualMainFiles?.[mainFilePath]) {
        let file = _rf(sym, mainFilePath, true);
        let mainFileData = { ...file, lastUsed: Date.now() };
        if (mainFileData.keys) moveToKeysFiles(sym, mainFilePath);

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
