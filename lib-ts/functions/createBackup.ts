import fs from "fs";
import { i } from "..";
import path from "path";
import dayjs from "dayjs";
import { _log } from "./_log";
import childProcess from "child_process";

export function createBackup(sym: string) {
  let startPath = i.splitterData[sym]._options.startpath;
  let backupStartPath = i.splitterData[sym]._options.backupPath;
  let backupPath = path.resolve(
    backupStartPath,
    `${dayjs().format("YYYY-MM/DD/HH:mm:ss.SSS")}`
  );
  if (!fs.existsSync(startPath))
    return _log(2, Error("startPath does not exist"));
  if (i.splitterData[sym]._options.backupZip) {
    try {
      fs.mkdirSync(backupPath, { recursive: true });
      childProcess.execSync(
        `zip -r ${path.resolve(backupPath, `backup.zip`)} ${startPath}`
      );

      return;
    } catch (e) {
      console.error(e);
    }
  }

  fs.cpSync(startPath, backupPath, { recursive: true });
}
