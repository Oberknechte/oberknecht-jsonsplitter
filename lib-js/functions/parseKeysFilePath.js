"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseKeysFilePath = parseKeysFilePath;
const oberknecht_utils_1 = require("oberknecht-utils");
const path_1 = __importDefault(require("path"));
const correctpath_1 = require("./correctpath");
function parseKeysFilePath(mainFilePath, pathParts) {
    return (0, correctpath_1.correctpath)(path_1.default.resolve(mainFilePath.replace(/\/_main\.json$/, ""), "./keys", ...(0, oberknecht_utils_1.convertToArray)(pathParts, false)));
}
