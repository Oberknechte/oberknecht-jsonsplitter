import { i } from "..";
import { _log } from "../functions/_log";
import { _wf } from "../functions/_wf";

export async function fileChange(sym: string, auto?: boolean) {
  return new Promise<void>((resolve) => {
    let changed_files = 0;
    i.oberknechtEmitter[sym].emit(
      "filechange",
      `${auto ? "[Automatic] " : ""} Executed`
    );
    if (i.splitterData[sym]._options?.debug >= 2)
      _log(
        0,
        `[JSONSPLITTER] [FILECHANGE] ${auto ? "[Automatic] " : ""} Executed`
      );
    if (!i.splitterData[sym]?.actualFiles) return;
    Object.keys(i.splitterData[sym].actualMainFiles).forEach((mainfilepath) => {
      let mainFile = i.splitterData[sym].actualMainFiles[mainfilepath];
      if ((mainFile.hasChanges ?? []).length == 0) return;

      mainFile.hasChanges.forEach((filepath) => {
        changed_files++;
        mainFile.hasChanges.splice(mainFile.hasChanges.indexOf(filepath), 1);

        let file = i.splitterData[sym].actualFiles[filepath];
        if (file) _wf(sym, filepath, file);
        else delete i.splitterData[sym].actualFiles[filepath];
      });

      if (mainFile.lastUsed) delete mainFile.lastUsed;
      _wf(sym, mainfilepath, mainFile);
    });

    i.oberknechtEmitter[sym].emit(
      "filechange",
      `${auto ? "[Automatic] " : ""}Finished, changed ${changed_files} files`
    );
    if (i.splitterData[sym]._options?.debug >= 2)
      _log(
        0,
        `[JSONSPLITTER] [FILECHANGE] ${
          auto ? "[Automatic] " : ""
        } Changed ${changed_files} files`
      );

    resolve();
  });
}
