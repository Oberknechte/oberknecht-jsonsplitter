"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.correctpath = void 0;
const oberknecht_utils_1 = require("oberknecht-utils");
const path_1 = __importDefault(require("path"));
function correctpath(p) {
    return p.replace(new RegExp((0, oberknecht_utils_1.regexEscape)(path_1.default.sep), "g"), "/");
}
exports.correctpath = correctpath;
