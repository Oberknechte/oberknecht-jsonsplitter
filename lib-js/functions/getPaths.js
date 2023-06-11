"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPaths = void 0;
const path_1 = __importDefault(require("path"));
const __1 = require("..");
const fs_1 = __importDefault(require("fs"));
const _mainpath_1 = require("./_mainpath");
const correctpath_1 = require("./correctpath");
function getPaths(sym) {
    let paths = {};
    function rd(dirpath) {
        let dir = fs_1.default.readdirSync(dirpath, { withFileTypes: true });
        dir
            .filter((a) => a.isFile() && a.name !== "_main.json")
            .forEach((path_) => {
            paths[(0, correctpath_1.correctpath)(path_1.default.resolve(dirpath, path_.name))] = path_1.default
                .resolve(dirpath, path_.name)
                .replace((0, _mainpath_1._mainpath)(sym), "")
                .replace(/^\/|\/$/g, "");
        });
        dir
            .filter((a) => a.isDirectory())
            .forEach((dir_) => {
            rd(path_1.default.resolve(dirpath, dir_.name));
        });
    }
    rd(__1.i.splitterData[sym]._options.startpath);
    __1.i.splitterData[sym].paths = paths;
    return paths;
}
exports.getPaths = getPaths;
