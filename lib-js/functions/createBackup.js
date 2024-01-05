"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBackup = void 0;
const fs_1 = __importDefault(require("fs"));
const __1 = require("..");
const path_1 = __importDefault(require("path"));
const dayjs_1 = __importDefault(require("dayjs"));
const _log_1 = require("./_log");
const child_process_1 = __importDefault(require("child_process"));
const oberknecht_utils_1 = require("oberknecht-utils");
function createBackup(sym, isAuto) {
    let splitterOptions = __1.i.splitterData[sym]._options;
    let startPath = splitterOptions.startpath;
    let backupStartPath = splitterOptions.backupPath;
    let backupPath = path_1.default.resolve(backupStartPath, `${(0, dayjs_1.default)().format("YYYY-MM/DD/HH:mm:ss.SSS")}`);
    if (!fs_1.default.existsSync(startPath))
        return (0, _log_1._log)(2, Error("startPath does not exist"));
    (() => {
        if (splitterOptions.backupZip) {
            try {
                fs_1.default.mkdirSync(backupPath, { recursive: true });
                child_process_1.default.execSync(`zip -r ${path_1.default.resolve(backupPath, `backup.zip`)} ${startPath}`);
                backupLog(true);
                return;
            }
            catch (e) {
                console.error(e);
            }
        }
        fs_1.default.cpSync(startPath, backupPath, { recursive: true });
        backupLog(false);
    })();
    deleteOldBackups();
    function backupLog(zip) {
        (0, _log_1._log)(1, `[${sym.toUpperCase()}] ${isAuto ? "[Auto] " : ""}Created backup ${backupPath} (Zip: ${zip ?? false})`);
    }
    function deleteOldBackups() {
        if (!splitterOptions.backupNumMax || splitterOptions.backupNumMax <= 0)
            return;
        function readDir(pathParts) {
            let backupPaths = [];
            fs_1.default.readdirSync(path_1.default.resolve(...pathParts), {
                withFileTypes: true,
            }).forEach((a) => {
                if (!a.isDirectory())
                    return;
                if (/(\d{2}:){2}\d{2}\.\d{3}/.test(a.name)) {
                    backupPaths.push(path_1.default.resolve(...pathParts, a.name));
                    return;
                }
                backupPaths.push(...readDir([...pathParts, a.name]));
            });
            return backupPaths;
        }
        let backupPaths = readDir([backupStartPath]);
        let deleteBackupsPaths = backupPaths.slice(0, backupPaths.length - splitterOptions.backupNumMax);
        deleteBackupsPaths.forEach((a) => {
            fs_1.default.rmSync(a, { force: true, recursive: true });
        });
        (0, _log_1._log)(1, `[${sym.toUpperCase()}] Deleted ${deleteBackupsPaths.length} old backup${(0, oberknecht_utils_1.returnOnNumber)(deleteBackupsPaths.length, 1, "s")}`);
    }
}
exports.createBackup = createBackup;
