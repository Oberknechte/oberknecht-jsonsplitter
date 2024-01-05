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
function createBackup(sym) {
    let startPath = __1.i.splitterData[sym]._options.startpath;
    let backupStartPath = __1.i.splitterData[sym]._options.backupPath;
    let backupPath = path_1.default.resolve(backupStartPath, `${(0, dayjs_1.default)().format("YYYY-MM/DD/HH:mm:ss.SSS")}`);
    if (!fs_1.default.existsSync(startPath))
        return (0, _log_1._log)(2, Error("startPath does not exist"));
    if (__1.i.splitterData[sym]._options.backupZip) {
        try {
            fs_1.default.mkdirSync(backupPath, { recursive: true });
            child_process_1.default.execSync(`zip -r ${path_1.default.resolve(backupPath, `backup.zip`)} ${startPath}`);
            return;
        }
        catch (e) {
            console.error(e);
        }
    }
    fs_1.default.cpSync(startPath, backupPath, { recursive: true });
}
exports.createBackup = createBackup;
