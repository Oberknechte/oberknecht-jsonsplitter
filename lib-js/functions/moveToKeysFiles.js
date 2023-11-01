"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.moveToKeysFiles = void 0;
const __1 = require("..");
const fs_1 = __importDefault(require("fs"));
const parseKeysFilePath_1 = require("./parseKeysFilePath");
const addKeyToFileKeys_1 = require("./addKeyToFileKeys");
const fileChange_1 = require("../handlers/fileChange");
function moveToKeysFiles(sym, mainFilePath) {
    let mainFile = __1.i.splitterData[sym].mainFiles[mainFilePath]?.();
    if (!mainFile?.keys || mainFile.keysMoved)
        return false;
    let keysFolderPath = (0, parseKeysFilePath_1.parseKeysFilePath)(mainFilePath);
    if (!fs_1.default.existsSync(keysFolderPath))
        fs_1.default.mkdirSync(keysFolderPath);
    Object.keys(mainFile.keys).forEach((key) => {
        let val = mainFile.keys[key];
        (0, addKeyToFileKeys_1.addKeyToFileKeys)(sym, mainFilePath, key, val);
    });
    delete mainFile.keys;
    mainFile.hasKeyChanges = true;
    (0, fileChange_1.fileChange)(sym, true);
    return true;
}
exports.moveToKeysFiles = moveToKeysFiles;
