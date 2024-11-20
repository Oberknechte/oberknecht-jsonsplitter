import { arrayModifiers, recreate } from "oberknecht-utils";
import { i } from "..";
import { _log } from "../functions/_log";
import { _wf } from "../functions/_wf";
import { appendDebugLogs } from "../functions/debugLog";

export async function fileChange(sym: string, auto?: boolean) {
  return new Promise<void>(async (resolve) => {
    let changed_files = 0;
    i.oberknechtEmitter[sym].emit(
      "filechange",
      `${auto ? "[Automatic] " : ""} Executed`
    );
    if (i.splitterData[sym]._options?.debug > 2)
      _log(
        0,
        `[JSONSPLITTER] [FILECHANGE] ${auto ? "[Automatic] " : ""} Executed`
      );

    if (!i.splitterData[sym]?.actualFiles) return;
    Object.keys(i.splitterData[sym].actualMainFiles).forEach((mainFilePath) => {
      let mainFile = i.splitterData[sym].actualMainFiles[mainFilePath];
      let mainFile_ = { ...mainFile };
      if (
        !mainFile_.keysMoved &&
        !mainFile_.hasChanges &&
        !mainFile_.hasKeyChanges &&
        !mainFile_.saveme
      )
        return;
      if (mainFile_.keysMoved) delete mainFile_.keys;
      if ((mainFile_.hasChanges ?? []).length === 0 && !mainFile_.hasKeyChanges)
        return;
      // return _wf(sym, mainFilePath, mainFile_, "main");

      // console.log("before save", mainFile_);

      arrayModifiers
        .removeDuplicates(mainFile_.hasChanges)
        .forEach((filepath: string) => {
          if (filepath.length === 0 || filepath.endsWith("_main.json")) return;
          changed_files++;

          let file = i.splitterData[sym].actualFiles[filepath];
          if (file) _wf(sym, filepath, file);
          else delete i.splitterData[sym].actualFiles[filepath];
        });

      if (mainFile_.hasKeyChanges) delete mainFile_.hasKeyChanges;

      mainFile_.hasChanges = [];
      if (mainFile_.lastUsed) delete mainFile_.lastUsed;
      if (mainFile_.saveme) delete mainFile_.saveme;
      _wf(sym, mainFilePath, mainFile_, "main");
    });

    Object.keys(i.splitterData[sym].actualKeysFiles).forEach((keysFilePath) => {
      let keysFile = i.splitterData[sym].actualKeysFiles[keysFilePath];
      if (!keysFile.hasChanges) return;
      delete keysFile.hasChanges;
      if (keysFile.lastUsed) delete keysFile.lastUsed;
      _wf(sym, keysFilePath, keysFile);
      changed_files++;
    });

    i.oberknechtEmitter[sym].emit(
      "filechange",
      `${auto ? "[Automatic] " : ""}Finished, changed ${changed_files} files`
    );
    if (i.splitterData[sym]._options?.debug > 2)
      _log(
        0,
        `[JSONSPLITTER] [FILECHANGE] ${
          auto ? "[Automatic] " : ""
        } Changed ${changed_files} files`
      );

    if (i.splitterData[sym]?._options?.debugsLogDir)
      await appendDebugLogs(sym).catch();

    resolve();
  });
}
