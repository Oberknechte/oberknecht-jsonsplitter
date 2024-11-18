"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMainPaths = getMainPaths;
const path_1 = __importDefault(require("path"));
const __1 = require("..");
const fs_1 = __importDefault(require("fs"));
const _mainpath_1 = require("./_mainpath");
const correctpath_1 = require("./correctpath");
const debugLog_1 = require("./debugLog");
function getMainPaths(sym) {
    (0, debugLog_1.debugLog)(sym, "getMainPaths", ...arguments);
    let mainPaths = {};
    function rd(dirpath) {
        let dir = fs_1.default.readdirSync(dirpath, { withFileTypes: true });
        let mains = dir.filter((a) => a.name === "_main.json");
        if (mains.length > 0)
            mainPaths[(0, correctpath_1.correctpath)(path_1.default.resolve(dirpath, mains[0].name))] = (0, correctpath_1.correctpath)(path_1.default.resolve(dirpath, mains[0].name))
                .replace((0, _mainpath_1._mainpath)(sym), "")
                .replace(/^\/|\/$/g, "");
        dir
            .filter((a) => a.isDirectory())
            .forEach((dir_) => {
            rd(path_1.default.resolve(dirpath, dir_.name));
        });
    }
    rd(__1.i.splitterData[sym]._options.startpath);
    __1.i.splitterData[sym].mainPaths = mainPaths;
    return mainPaths;
}
