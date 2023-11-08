"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getKeysPaths = void 0;
const path_1 = __importDefault(require("path"));
const __1 = require("..");
const fs_1 = __importDefault(require("fs"));
const _mainpath_1 = require("./_mainpath");
const correctpath_1 = require("./correctpath");
const debugLog_1 = require("./debugLog");
function getKeysPaths(sym) {
    (0, debugLog_1.debugLog)(sym, "getKeysPaths", ...arguments);
    let keysPaths = {};
    function rd(dirpath) {
        let dir = fs_1.default.readdirSync(dirpath, { withFileTypes: true });
        let keys = dir.filter((a) => /^keys\d+\.json$/.test(a.name));
        if (/\/keys$/.test(dirpath) && keys.length > 0)
            keys.forEach((key) => {
                keysPaths[(0, correctpath_1.correctpath)(path_1.default.resolve(dirpath, key.name))] = path_1.default
                    .resolve(dirpath, key.name)
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
    __1.i.splitterData[sym].keysPaths = keysPaths;
    return keysPaths;
}
exports.getKeysPaths = getKeysPaths;
