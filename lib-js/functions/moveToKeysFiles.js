"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.moveToKeysFiles = exports.moveToKeysFilesSync = void 0;
const __1 = require("..");
const fs_1 = __importDefault(require("fs"));
const parseKeysFilePath_1 = require("./parseKeysFilePath");
const addKeyToFileKeys_1 = require("./addKeyToFileKeys");
const fileChange_1 = require("../handlers/fileChange");
const oberknecht_utils_1 = require("oberknecht-utils");
const debugLog_1 = require("./debugLog");
const jsonsplitter_1 = require("../types/jsonsplitter");
const saveKeysFile_1 = require("./saveKeysFile");
let movingFiles = {};
function moveToKeysFilesSync(sym, mainFilePath) {
    (0, debugLog_1.debugLog)(sym, "moveToKeysFiles", ...arguments);
    let mainFile = __1.i.splitterData[sym].mainFiles[mainFilePath]?.();
    const moveStart = Date.now();
    (0, oberknecht_utils_1.log)(1, "Moving keys of mainfile", mainFilePath, `(Has moved: ${(!mainFile?.keys || mainFile.keysMoved) === true}`, `jsonsplitter: ${sym}`);
    if (!mainFile?.keys || mainFile.keysMoved)
        return false;
    let keysFolderPath = (0, parseKeysFilePath_1.parseKeysFilePath)(mainFilePath);
    if (!fs_1.default.existsSync(keysFolderPath))
        fs_1.default.mkdirSync(keysFolderPath);
    const chunkCreateStart = Date.now();
    (0, oberknecht_utils_1.log)(1, "Creating Chunks of mainfile", mainFilePath, `jsonsplitter: ${sym}`);
    let maxSize = __1.i.splitterData[sym]._options?.maxKeysFileSize ?? jsonsplitter_1.defaultKeysFileSize;
    let chunks = [""];
    const chunkSeperator = ";";
    function getSeperator(chunk) {
        return chunk.length > 0 ? chunkSeperator : "";
    }
    Object.keys(mainFile.keys).forEach((key) => {
        if (Buffer.from(chunks.at(-1) +
            getSeperator(chunks.at(-1)) +
            `${key},${mainFile.keys[key]}`).byteLength > maxSize)
            chunks.push("");
        chunks[chunks.length - 1] =
            chunks.at(-1) +
                getSeperator(chunks.at(-1)) +
                `${key},${mainFile.keys[key]}`;
    });
    const chunkCreateEnd = Date.now();
    (0, oberknecht_utils_1.log)(1, `Created ${chunks.length} Chunks of mainfile`, mainFilePath, `jsonsplitter: ${sym}`, 
    // @ts-ignore
    `(Took ${(0, oberknecht_utils_1.cleanTime)(chunkCreateEnd - chunkCreateStart, 4).time.join(" ")})`);
    let chunks_ = [];
    chunks.forEach((chunk, i) => {
        chunks_.push({});
        chunk.split(chunkSeperator).forEach((part) => {
            let ps = part.split(",");
            (0, oberknecht_utils_1.addKeysToObject)(chunks_[i], ["keys", ps[0]], ps[1]);
        });
    });
    const chunkRevertEnd = Date.now();
    (0, oberknecht_utils_1.log)(1, `Reversed ${chunks_.length} Chunks of mainfile`, mainFilePath, `jsonsplitter: ${sym}`, 
    // @ts-ignore
    `(Reverting Took ${(0, oberknecht_utils_1.cleanTime)(chunkRevertEnd - chunkCreateEnd, 4).time.join(" ")}; Total time took ${(0, oberknecht_utils_1.cleanTime)(chunkCreateEnd - chunkCreateStart, 4
    // @ts-ignore
    ).time.join(" ")})`);
    chunks_.map((chunk_) => {
        (0, addKeyToFileKeys_1.addKeyToFileKeys)(sym, mainFilePath, chunk_, true);
    });
    fs_1.default.writeFileSync(mainFilePath + ".old", JSON.stringify(mainFile), "utf-8");
    mainFile.keysMoved = true;
    delete mainFile.keys;
    mainFile.hasKeyChanges = true;
    (0, fileChange_1.fileChange)(sym, true);
    (0, saveKeysFile_1.saveKeysFile)(sym, Object.keys(__1.i.splitterData[sym].keysFiles)
        .filter((a) => a.replace(/keys\/keys\d+\.json$/, "_main.json") === mainFilePath)
        .sort((a, b) => parseInt(a.replace(/.+keys(?=\d+\.json$)/, "").replace(/\.json$/, "")) -
        parseInt(b.replace(/.+keys(?=\d+\.json$)/, "").replace(/\.json$/, "")))
        .at(-1));
    const moveEnd = Date.now();
    (0, oberknecht_utils_1.log)(1, "Moved keys of mainfile", mainFilePath, 
    // @ts-ignore
    `(Took ${(0, oberknecht_utils_1.cleanTime)(moveEnd - moveStart, 4).time.join(" ")})`);
    return true;
}
exports.moveToKeysFilesSync = moveToKeysFilesSync;
async function moveToKeysFiles(sym, mainFilePath) {
    if ((0, oberknecht_utils_1.getKeyFromObject)(movingFiles, [sym, mainFilePath]))
        return (0, oberknecht_utils_1.getKeyFromObject)(movingFiles, [sym, mainFilePath]);
    let prom = new Promise((resolve, reject) => {
        moveToKeysFilesSync(sym, mainFilePath);
    });
    (0, oberknecht_utils_1.addKeysToObject)(movingFiles, [sym, mainFilePath], prom);
}
exports.moveToKeysFiles = moveToKeysFiles;
