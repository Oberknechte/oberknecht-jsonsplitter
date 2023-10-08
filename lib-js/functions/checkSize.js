"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkSize = void 0;
const jsonsplitter_1 = require("../types/jsonsplitter");
function checkSize(file, object) {
    if (!file && !object)
        return false;
    const fileBuffer = !file
        ? undefined
        : Buffer.from(typeof file === "object" ? JSON.stringify(file) : file.toString(), "utf-8");
    const objectBuffer = !object
        ? undefined
        : Buffer.from(typeof object === "object" ? JSON.stringify(object) : object.toString(), "utf-8");
    if (!object && fileBuffer)
        return fileBuffer.byteLength >= jsonsplitter_1.maxJSONSize;
    if (!file && objectBuffer)
        return objectBuffer.byteLength >= jsonsplitter_1.maxJSONSize;
    return fileBuffer.byteLength + objectBuffer.byteLength >= jsonsplitter_1.maxJSONSize;
}
exports.checkSize = checkSize;
