"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uncorrectpath = void 0;
const path_1 = __importDefault(require("path"));
function uncorrectpath(p) {
    return p.replace(/\//g, path_1.default.sep);
}
exports.uncorrectpath = uncorrectpath;
