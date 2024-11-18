"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkSize = checkSize;
const __1 = require("..");
const jsonsplitter_1 = require("../types/jsonsplitter");
const debugLog_1 = require("./debugLog");
function checkSize(sym, file, object, size, objectSizeMultiplier) {
    (0, debugLog_1.debugLog)(sym, "checkSize", ...arguments);
    if (!file && !object)
        return false;
    const fileBuffer = !file
        ? undefined
        : typeof file === "number"
            ? file
            : Buffer.from(typeof file === "object" ? JSON.stringify(file) : file.toString(), "utf-8").byteLength;
    const objectBuffer = !object
        ? undefined
        : typeof object === "number"
            ? object
            : Buffer.from(typeof object === "object" ? JSON.stringify(object) : object.toString(), "utf-8").byteLength;
    let maxSize = size ?? __1.i.splitterData[sym]._options?.maxFileSize ?? jsonsplitter_1.maxJSONSize;
    if (maxSize > jsonsplitter_1.maxJSONSize || maxSize <= 0)
        maxSize = jsonsplitter_1.maxJSONSize;
    if (!object && fileBuffer)
        return fileBuffer >= maxSize;
    if (!file && objectBuffer)
        return objectBuffer * (objectSizeMultiplier ?? 1) >= maxSize;
    return fileBuffer + objectBuffer >= maxSize;
}
