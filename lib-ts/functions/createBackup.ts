import fs, { readdir } from "fs";
import { i } from "..";
import path from "path";
import dayjs from "dayjs";
import { _log } from "./_log";
import childProcess from "child_process";
import { jsonsplitteroptions } from "../types/jsonsplitter.options";
import { returnOnNumber } from "oberknecht-utils";

export function createBackup(sym: string, isAuto?: boolean) {
  let splitterOptions: jsonsplitteroptions = i.splitterData[sym]._options;
  let startPath = splitterOptions.startpath;
  let backupStartPath = splitterOptions.backupPath;
  let backupPath = path.resolve(
    backupStartPath,
    `${dayjs().format("YYYY-MM/DD/HH:mm:ss.SSS")}`
  );
  if (!fs.existsSync(startPath))
    return _log(2, Error("startPath does not exist"));

  (() => {
    if (splitterOptions.backupZip) {
      try {
        fs.mkdirSync(backupPath, { recursive: true });
        childProcess.execSync(
          `zip -r ${path.resolve(backupPath, `backup.zip`)} ${startPath}`
        );

        backupLog(true);

        return;
      } catch (e) {
        console.error(e);
      }
    }

    fs.cpSync(startPath, backupPath, { recursive: true });

    backupLog(false);
  })();

  deleteOldBackups();

  function backupLog(zip?: boolean) {
    _log(
      1,
      `[${sym.toUpperCase()}] ${
        isAuto ? "[Auto] " : ""
      }Created backup ${backupPath} (Zip: ${zip ?? false})`
    );
  }

  function deleteOldBackups() {
    if (!splitterOptions.backupNumMax || splitterOptions.backupNumMax <= 0)
      return;

    function readDir(pathParts: string[]) {
      let backupPaths = [];
      fs.readdirSync(path.resolve(...pathParts), {
        withFileTypes: true,
      }).forEach((a) => {
        if (!a.isDirectory()) return;
        if (/(\d{2}:){2}\d{2}\.\d{3}/.test(a.name)) {
          backupPaths.push(path.resolve(...pathParts, a.name));
          return;
        }
        backupPaths.push(...readDir([...pathParts, a.name]));
      });

      return backupPaths;
    }

    let backupPaths = readDir([backupStartPath]);
    let deleteBackupsPaths = backupPaths.slice(
      0,
      backupPaths.length - splitterOptions.backupNumMax
    );
    deleteBackupsPaths.forEach((a) => {
      fs.rmSync(a, { force: true, recursive: true });
    });

    _log(
      1,
      `[${sym.toUpperCase()}] Deleted ${
        deleteBackupsPaths.length
      } old backup${returnOnNumber(deleteBackupsPaths.length, 1, "s")}`
    );
  }
}
