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
const oberknecht_utils_1 = require("oberknecht-utils");
const debugLog_1 = require("./debugLog");
const jsonsplitter_1 = require("../types/jsonsplitter");
async function moveToKeysFiles(sym, mainFilePath) {
    (0, debugLog_1.debugLog)(sym, "moveToKeysFiles", ...arguments);
    let mainFile = __1.i.splitterData[sym].mainFiles[mainFilePath]?.();
    const moveStart = Date.now();
    (0, oberknecht_utils_1.log)(1, "Moving keys of mainfile", mainFilePath, (!mainFile?.keys || mainFile.keysMoved) === true);
    if (!mainFile?.keys || mainFile.keysMoved)
        return false;
    let keysFolderPath = (0, parseKeysFilePath_1.parseKeysFilePath)(mainFilePath);
    if (!fs_1.default.existsSync(keysFolderPath))
        fs_1.default.mkdirSync(keysFolderPath);
    let lastTimes = [];
    (0, oberknecht_utils_1.log)(1, "Creating Chunks of mainfile");
    let maxSize = __1.i.splitterData[sym]._options?.maxFileSize ?? jsonsplitter_1.maxJSONSize;
    let chunks = [""];
    const chunkSeperator = ";";
    function getSeperator(chunk) {
        return chunk.length > 0 ? chunkSeperator : "";
    }
    Object.keys(mainFile.keys).forEach((key) => {
        if (Buffer.from(chunks.at(-1) + getSeperator(chunks.at(-1)) + `${key},${mainFile.keys[key]}`).byteLength > maxSize)
            chunks.push("");
        chunks[chunks.length - 1] = chunks.at(-1) + getSeperator(chunks.at(-1)) + `${key},${mainFile.keys[key]}`;
    });
    (0, oberknecht_utils_1.log)(1, "Created Chunks of mainfile");
    await Promise.all(chunks.map(async (chunk) => {
        return new Promise((resolve) => {
            (0, addKeyToFileKeys_1.addKeyToFileKeys)(sym, mainFilePath, chunk);
            resolve();
        });
    }));
    // await Promise.all(
    //   chunkArray(
    //     Object.keys(mainFile.keys),
    //     i.splitterData[sym]?._options?.moveToKeysFilesChunkSize ??
    //       defaultMoveToKeysFileChunkSize
    //   ).map(async (chunk) => {
    //     return new Promise<void>((resolve) => {
    //       let vals = chunk.map((key) => mainFile.keys[key]);
    //       lastTimes.push(Date.now());
    //       addKeyToFileKeys(sym, mainFilePath, chunk, vals);
    //       resolve();
    //     });
    //   })
    // );
    // Object.keys(mainFile.keys).map((key) => {
    //   let val = mainFile.keys[key];
    //   lastTimes.push(Date.now());
    //   addKeyToFileKeys(sym, mainFilePath, key, val);
    // });
    delete mainFile.keys;
    mainFile.hasKeyChanges = true;
    (0, fileChange_1.fileChange)(sym, true);
    const moveEnd = Date.now();
    (0, oberknecht_utils_1.log)(1, "Moved keys of mainfile", mainFilePath, 
    // @ts-ignore
    `(Took ${(0, oberknecht_utils_1.cleanTime)(moveEnd - moveStart, 4).time.join("")})`);
    return true;
}
exports.moveToKeysFiles = moveToKeysFiles;
