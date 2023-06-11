"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.jsonsplitter = void 0;
const oberknecht_emitters_1 = require("oberknecht-emitters");
const oberknecht_utils_1 = require("oberknecht-utils");
const _mainpath_1 = require("../functions/_mainpath");
const _cdir_1 = require("../functions/_cdir");
const _wf_1 = require("../functions/_wf");
const __1 = require("..");
const getMainFiles_1 = require("../functions/getMainFiles");
const getPaths_1 = require("../functions/getPaths");
const getFiles_1 = require("../functions/getFiles");
const fileChange_1 = require("../handlers/fileChange");
const clearCache_1 = require("../functions/clearCache");
const clearCacheSmart_1 = require("../functions/clearCacheSmart");
const _log_1 = require("../functions/_log");
const fs_1 = __importDefault(require("fs"));
const getMainPaths_1 = require("../functions/getMainPaths");
const slashreg = /^\/|\/$/g;
const _mainreg = /_main\.json$/g;
let clientSymNum = 0;
class jsonsplitter {
    #symbol = `jsonsplitter-${clientSymNum++}`;
    get symbol() {
        return this.#symbol;
    }
    oberknechtEmitter = new oberknecht_emitters_1.oberknechtEmitter();
    get _mainpaths() {
        return __1.i.splitterData[this.symbol]?.mainPaths ?? (0, getMainPaths_1.getMainPaths)(this.symbol);
    }
    get _mainfiles() {
        return __1.i.splitterData[this.symbol]?.mainFiles ?? (0, getMainFiles_1.getMainFiles)(this.symbol);
    }
    get _paths() {
        return __1.i.splitterData[this.symbol]?.paths ?? (0, getPaths_1.getPaths)(this.symbol);
    }
    get _files() {
        return __1.i.splitterData[this.symbol]?.files ?? (0, getFiles_1.getFiles)(this.symbol);
    }
    get _actions() {
        return __1.i.splitterData[this.symbol].actions ?? [];
    }
    _options;
    constructor(options) {
        let options_ = (options ?? {});
        options_.child_folders_keys = options_?.child_folders_keys ?? 1;
        options_.max_keys_in_file = options_?.max_keys_in_file ?? 3000;
        options_.startpath = options_?.startpath
            ? options_.startpath.startsWith("/")
                ? options_?.startpath
                : (0, _mainpath_1._mainpath)(options_.startpath)
            : (0, _mainpath_1._mainpath)("./data");
        (0, _cdir_1._cdir)(this.symbol, options_.startpath);
        options_.debug = options_.debug ?? 2;
        options_.cacheSettings = options_.cacheSettings ?? {};
        options_.cacheSettings.maxFileCacheAge =
            options_.cacheSettings.maxFileCacheAge ?? 600000;
        options_.cacheSettings.maxMainFileCacheAge =
            options_.cacheSettings.maxMainFileCacheAge ?? 600000;
        if (options_.debug >= 0)
            (0, _log_1._log)(1, `[JSONSPLITTER] Initializing \tDirectory: ${options_.startpath}`);
        __1.i.splitterData[this.symbol] = {
            actualFiles: {},
            actualMainFiles: {},
        };
        this._options = __1.i.splitterData[this.symbol]._options = options_;
        __1.i.oberknechtEmitter[this.symbol] = this.oberknechtEmitter;
        // process.on("unhandledRejection", e => this.oberknechtEmitter.emitError("unhandledRejection", e));
        // process.on("uncaughtException", e => this.oberknechtEmitter.emitError("uncaughtException", e));
        (0, getMainFiles_1.getMainFiles)(this.symbol);
        (0, getFiles_1.getFiles)(this.symbol);
        __1.i.splitterData[this.symbol].filechangeInterval = setInterval(() => {
            (0, fileChange_1.fileChange)(this.symbol, true);
        }, options_.filechange_interval ?? 15000);
        if (!options_.cacheSettings.noAutoClearCacheSmart)
            __1.i.splitterData[this.symbol].clearCacheInterval = setInterval(() => {
                (0, clearCacheSmart_1.clearCacheSmart)(this.symbol);
            }, [options_.cacheSettings.autoClearInterval, options_.cacheSettings.maxFileCacheAge, options_.cacheSettings.maxMainFileCacheAge].filter((a) => a).sort()[0]);
    }
    addAction = (action) => {
        if (!__1.i.splitterData[this.symbol].actions)
            __1.i.splitterData[this.symbol].actions = [];
        __1.i.splitterData[this.symbol].actions = __1.i.splitterData[this.symbol].actions.slice(0, 9);
        __1.i.splitterData[this.symbol].actions.push(Error(action));
    };
    on = (type, callback) => {
        return this.oberknechtEmitter.on(type, callback);
    };
    onError = (callback) => {
        return this.oberknechtEmitter.on("error", callback);
    };
    emitError = (e) => {
        return this.oberknechtEmitter.emitError("error", e);
    };
    create = (object) => {
        return new Promise((resolve, reject) => {
            let objdir = this.getDirPathsByObject(object);
            objdir.forEach((obj) => {
                (0, _cdir_1._cdir)(this.symbol, (0, _mainpath_1._mainpath)(this.symbol, [...obj.path]));
                let objmainpath = (0, _mainpath_1._mainpath)(this.symbol, [...obj.path, "_main.json"]);
                let objmain = {};
                let keychunks = (0, oberknecht_utils_1.chunkArray)(Object.keys(obj.object), this._options.max_keys_in_file);
                objmain.filenum = 0;
                objmain.filekeynum = 0;
                objmain.num = 0;
                objmain.keys = {};
                objmain.keynames = obj.path;
                if (keychunks.length === 0)
                    (0, _wf_1._wf)(this.symbol, (0, _mainpath_1._mainpath)(this.symbol, [...obj.path, `0.json`]), this.createObjectFromKeys(obj.path, {}));
                keychunks.forEach((keychunk, i) => {
                    let keychunk_ = {};
                    objmain.num += keychunk.length;
                    objmain.filekeynum = keychunk.length;
                    objmain.filenum = i;
                    keychunk.forEach((a) => {
                        keychunk_[a] = obj.object[a];
                        objmain.keys[a] = i;
                    });
                    let chunkfile = this.createObjectFromKeys(obj.path, keychunk_);
                    (0, _wf_1._wf)(this.symbol, (0, _mainpath_1._mainpath)(this.symbol, [...obj.path, `${i}.json`]), chunkfile);
                });
                (0, _wf_1._wf)(this.symbol, objmainpath, objmain);
            });
            return resolve(objdir);
        });
    };
    destroy = async () => {
        return new Promise(async (resolve, reject) => {
            let errors = [];
            try {
                clearInterval(__1.i.splitterData[this.symbol].filechangeInterval);
                if (__1.i.splitterData[this.symbol].clearCacheInterval)
                    clearInterval(__1.i.splitterData[this.symbol].clearCacheInterval);
                await (0, fileChange_1.fileChange)(this.symbol);
                delete __1.i.splitterData[this.symbol];
            }
            catch (e) {
                errors.push(e);
            }
            return resolve();
        });
    };
    save = async () => {
        return new Promise(async (resolve, reject) => {
            let filechangeIntervalExisted = (__1.i.splitterData[this.symbol].filechangeInterval ?? undefined) !==
                undefined;
            if (filechangeIntervalExisted)
                clearInterval(__1.i.splitterData[this.symbol].filechangeInterval);
            await (0, fileChange_1.fileChange)(this.symbol);
            if (filechangeIntervalExisted)
                __1.i.splitterData[this.symbol].filechangeInterval = setInterval(() => {
                    (0, fileChange_1.fileChange)(this.symbol, true);
                }, this._options.filechange_interval ?? 15000);
            resolve();
        });
    };
    clearCache = (excludeMainFiles) => {
        return (0, clearCache_1.clearCache)(this.symbol, excludeMainFiles);
    };
    clearCacheSmart = (excludeMainFiles) => {
        return (0, clearCacheSmart_1.clearCacheSmart)(this.symbol, excludeMainFiles);
    };
    getDirPathsByObject = (o, n1) => {
        function getDirPathByObject(o2, n, ml, p, ob) {
            if (n >= ml ||
                Object.keys(o2).filter((a) => typeof o2[a] !== "object").length > 0) {
                ob._options.child_folders_keys = __1.i.splitterData[ob.symbol]._options.child_folders_keys = n;
                return {
                    path: p,
                    object: o2,
                };
            }
            const nn = n + 1;
            return Object.keys(o2).map((k3) => {
                const p2 = [...p, k3];
                return getDirPathByObject(o2[k3], nn, ml, p2, ob);
            });
        }
        return getDirPathByObject(o, 0, n1 ?? this._options.child_folders_keys, [], this);
    };
    getDirPathsByKeys = (keypath) => {
        let dp = (0, _mainpath_1._mainpath)(this.symbol, (0, oberknecht_utils_1.convertToArray)(keypath).join("/"));
        let rp = dp.split((0, _mainpath_1._mainpath)(this.symbol))[1].replace(slashreg, "");
        return [
            dp,
            dp
                .split("/")
                .slice(0, dp.split("/").length - rp.split("/").length + 1)
                .join("/"),
            dp
                .split("/")
                .slice(dp.split("/").length - rp.split("/").length + 1)
                .join("/"),
            dp
                .split("/")
                .slice(0, dp.split("/").length - rp.split("/").length + 1)
                .join("/") + "/_main.json",
        ];
    };
    createObjectFromKeys = (keys, value) => {
        let o = {};
        let keys_ = (0, oberknecht_utils_1.convertToArray)(keys);
        keys_.forEach((a, i) => {
            if (i === keys_.length - 1)
                o[a] = value;
            else
                o[a] = {};
        });
        return o;
    };
    getKeyArrayFromObject = (object) => {
        let r = [];
        function go(o2) {
            if (Object.keys(o2).length > 0)
                return;
            r.push(Object.keys(o2)[0]);
            go(o2[Object.keys(o2)[0]]);
        }
        go(object);
        return r;
    };
    getKeyArraysFromObject = (object) => {
        let r = [];
        function go(o2, arr) {
            Object.keys(o2).forEach((a) => {
                if ((0, oberknecht_utils_1.extendedTypeof)(o2[a]) === "json" &&
                    (Object.keys(o2[a]).length ?? 0) > 0) {
                    go(o2[a], [...arr, a]);
                }
                else {
                    r.push({
                        path: [...arr, a],
                        value: o2[a],
                    });
                }
            });
        }
        go(object, []);
        return r;
    };
    getFileByKeys = (keypath) => {
        let r = {
            path: undefined,
            dirpath: undefined,
            dirpaths: undefined,
            path_main: undefined,
            object: undefined,
            object_main: undefined,
            keyfound: false,
            filenum: undefined,
        };
        for (let i = 0; i < keypath.length; i++) {
            let dirpathkeys = this.getDirPathsByKeys(keypath.slice(0, i + 1));
            let filteredkeypath = Object.keys(this._mainpaths).filter((b) => new RegExp(`^${dirpathkeys[1]}\/_main\.json`).test(b));
            if (filteredkeypath.length > 0) {
                r.path_main = filteredkeypath[0];
                r.object_main = this._mainfiles[r.path_main];
                r.dirpath = dirpathkeys[1];
                r.dirpaths = Object.keys(this._paths).filter((a) => a.startsWith(r.dirpath));
                r.filenum = r.object_main().filenum;
                if ((r.object_main()?.keys?.[keypath[i + 1]] ?? undefined) !== undefined) {
                    r.filenum = r.object_main().keys[keypath[i + 1]];
                    r.keyfound = true;
                }
                r.path = r.path_main.replace(_mainreg, `${r.filenum}.json`);
                r.object = this._files[r.path];
                i = keypath.length;
            }
        }
        return {
            get object() {
                return r.object?.();
            },
            get object_() {
                return r.object;
            },
            get object_main() {
                return r.object_main?.();
            },
            get object_main_() {
                return r.object_main;
            },
            get path() {
                return r.path;
            },
            get path_main() {
                return r.path_main;
            },
            get keys() {
                return keypath;
            },
            dirpath: r.dirpath,
            dirpaths: r.dirpaths,
            keyfound: r.keyfound,
            filenum: r.filenum,
        };
    };
    // ↓ Synchronus functions ↓
    createSync = (object) => {
        this.addAction("createSync");
        let objdir = this.getDirPathsByObject(object);
        objdir.forEach((obj) => {
            (0, _cdir_1._cdir)(this.symbol, (0, _mainpath_1._mainpath)(this.symbol, [...obj.path]));
            let objmainpath = (0, _mainpath_1._mainpath)(this.symbol, [...obj.path, "_main.json"]);
            let objmain = {};
            let keychunks = (0, oberknecht_utils_1.chunkArray)(Object.keys(obj.object), this._options.max_keys_in_file);
            objmain.filenum = 0;
            objmain.filekeynum = 0;
            objmain.num = 0;
            objmain.keys = {};
            objmain.keynames = obj.path;
            if (keychunks.length === 0)
                (0, _wf_1._wf)(this.symbol, (0, _mainpath_1._mainpath)(this.symbol, [...obj.path, `0.json`]), this.createObjectFromKeys(obj.path, {}));
            keychunks.forEach((keychunk, i) => {
                let keychunk_ = {};
                objmain.num += keychunk.length;
                objmain.filekeynum = keychunk.length;
                objmain.filenum = i;
                keychunk.forEach((a) => {
                    keychunk_[a] = obj.object[a];
                    objmain.keys[a] = i;
                });
                let chunkfile = this.createObjectFromKeys(obj.path, keychunk_);
                (0, _wf_1._wf)(this.symbol, (0, _mainpath_1._mainpath)(this.symbol, [...obj.path, `${i}.json`]), chunkfile);
            });
            (0, _wf_1._wf)(this.symbol, objmainpath, objmain);
        });
        return objdir;
    };
    getMainKeySync = (keypath) => {
        this.addAction(`getMainKeySync`);
        let objpath = this.getFileByKeys(keypath);
        if (!objpath.object_main) {
            let err = Error(`objpath.object_main is undefined (keypath: ${keypath})`);
            this.emitError(err);
            return undefined;
        }
        return this.getKeyFromObjectSync(objpath.object_main, keypath.slice(1));
    };
    getKeySync = (keypath, emiterr) => {
        this.addAction(`getKeySync`);
        let keypath_ = (0, oberknecht_utils_1.convertToArray)(keypath);
        let objpath = this.getFileByKeys(keypath_);
        if (keypath_.length > 1) {
            if (!objpath.keyfound) {
                let err = Error(`objpath.keyfound is false (keypath: ${keypath_})`);
                if (emiterr)
                    this.emitError(err);
                return undefined;
            }
            return this.getKeyFromObjectSync(objpath.object, keypath_);
        }
        else {
            if (!objpath.object_main) {
                let err = Error(`objpath.object_main is undefined (keypath: ${keypath_})`);
                if (emiterr)
                    this.emitError(err);
                return undefined;
            }
            let r = {};
            [...Array((objpath.filenum ?? 0) + 1)].map((a, i) => {
                let file = this._files[objpath.path_main.replace(_mainreg, `${i}.json`)]();
                let objects = this.getKeyFromObjectSync(file, keypath_, emiterr);
                r = { ...r, ...objects };
            });
            return r;
        }
    };
    addKeySync = (keypath, value, nosilent) => {
        this.addAction(`addKeySync`);
        let keypath_ = (0, oberknecht_utils_1.convertToArray)(keypath);
        let objpath = this.getFileByKeys(keypath_);
        if (!objpath.object_main?.num)
            this.createSync(this.addKeysToObjectSync({}, keypath_, value));
        (0, getMainPaths_1.getMainPaths)(this.symbol);
        (0, getMainFiles_1.getMainFiles)(this.symbol);
        objpath = this.getFileByKeys(keypath_);
        let mainpath = objpath.path_main;
        let filepath = objpath.path;
        let file = objpath.object;
        if (objpath.object_main.filekeynum ==
            objpath.object_main.keynames.length + 1) {
            if (objpath.object_main.filekeynum >= this._options.max_keys_in_file) {
                objpath.object_main.filenum++;
                objpath.object_main.filekeynum = 0;
                filepath = objpath.path_main.replace(_mainreg, `${objpath.object_main.filenum}.json`);
                __1.i.splitterData[this.symbol].paths[filepath] = filepath
                    .replace((0, _mainpath_1._mainpath)(this.symbol), "")
                    .replace(slashreg, "");
                (0, _wf_1._wf)(this.symbol, filepath, this.createObjectFromKeys(objpath.object_main.keynames, {}));
                file = this._files[filepath];
            }
        }
        if (this.getKeyFromObjectSync(objpath.object_main, [
            "keys",
            objpath.keys[1],
        ]) === undefined) {
            objpath.object_main.num++;
            objpath.object_main.filekeynum++;
        }
        let newmainfile = this.addKeysToObjectSync(objpath.object_main, ["keys", objpath.keys[1]], objpath.object_main.filenum);
        let newfile = (__1.i.splitterData[this.symbol].actualFiles[filepath] = this.addKeysToObjectSync(file, keypath_, value));
        if (!newmainfile.hasChanges)
            newmainfile.hasChanges = [];
        if (!newmainfile.hasChanges.includes(filepath))
            newmainfile.hasChanges.push(filepath);
        __1.i.splitterData[this.symbol].actualMainFiles[mainpath] = newmainfile;
        if ((this._options.silent?._all || this._options.silent?.addKey) &&
            !nosilent)
            return true;
        // @ts-ignore
        return newfile;
    };
    editKeySync = (keypath, value, nosilent) => {
        this.addAction(`editKeySync`);
        let keypath_ = (0, oberknecht_utils_1.convertToArray)(keypath);
        let objpath = this.getFileByKeys(keypath_);
        let mainpath = objpath.path_main;
        let filepath = objpath.path;
        if (!objpath.object) {
            let err = Error(`file is undefined - could not get key from mainobject keys (keypath: ${keypath})`);
            this.emitError(err);
            return undefined;
        }
        let newfile;
        if (this.getKeyFromObjectSync(objpath.object_main, ["keys", keypath_[1]]) ===
            undefined) {
            newfile = this.addKeySync(keypath_, value, true);
        }
        else {
            newfile = this.addKeysToObjectSync(objpath.object, keypath_, value);
            if (!objpath.object_main.hasChanges)
                objpath.object_main.hasChanges = [];
            if (!objpath.object_main.hasChanges.includes(filepath))
                objpath.object_main.hasChanges.push(filepath);
            __1.i.splitterData[this.symbol].actualMainFiles[mainpath] =
                objpath.object_main;
            __1.i.splitterData[this.symbol].actualFiles[filepath] = newfile;
        }
        if ((this._options.silent?._all || this._options.silent?.editKey) &&
            !nosilent)
            return true;
        return newfile;
    };
    editKeyAddSync = (keypath, value, nosilent, emiterr) => {
        this.addAction(`editKeyAddSync`);
        let keypath_ = (0, oberknecht_utils_1.convertToArray)(keypath);
        let objpath = this.getFileByKeys(keypath_);
        let mainpath = objpath.path_main;
        let filepath = objpath.path;
        if (!objpath.object) {
            let err = Error(`file is undefined - could not get key from mainobject keys (keypath: ${keypath})`);
            if (emiterr)
                this.emitError(err);
            return undefined;
        }
        let newfile;
        if (this.getKeyFromObjectSync(objpath.object_main, ["keys", keypath_[1]]) ===
            undefined) {
            newfile = this.addKeySync(keypath_, value, true);
        }
        else {
            newfile = this.addAppendKeysToObjectSync(objpath.object, keypath_, value);
            if (!objpath.object_main.hasChanges)
                objpath.object_main.hasChanges = [];
            if (!objpath.object_main.hasChanges.includes(filepath))
                objpath.object_main.hasChanges.push(filepath);
            __1.i.splitterData[this.symbol].actualMainFiles[mainpath] =
                objpath.object_main;
            __1.i.splitterData[this.symbol].actualFiles[filepath] = newfile;
        }
        if ((this._options.silent?._all || this._options.silent?.editKeyAdd) &&
            !nosilent)
            return true;
        return newfile;
    };
    deleteKeySync = (keypath, nosilent, emiterr) => {
        this.addAction(`deleteKeySync`);
        let keypath_ = (0, oberknecht_utils_1.convertToArray)(keypath);
        let objpath = this.getFileByKeys(keypath_);
        if (!objpath.object_main) {
            let err = Error(`objpath.object_main is undefined (keypath: ${keypath_})`);
            if (emiterr)
                this.emitError(err);
            return undefined;
        }
        let mainpath = objpath.path_main;
        let filepath = objpath.path_main.replace(_mainreg, `${objpath.filenum}.json`);
        let file = objpath.object;
        if (keypath_.length >
            (objpath.object_main?.keynames?.length ?? this._options?.max_keys_in_file)) {
            let newfile = this.deleteKeyFromObjectSync(file, keypath_, emiterr);
            let mainfile = objpath.object_main;
            if (!mainfile.hasChanges)
                mainfile.hasChanges = [];
            if (!mainfile.hasChanges.includes(filepath))
                mainfile.hasChanges.push(filepath);
            if (keypath_.length === objpath.object_main.keynames.length + 1) {
                this.deleteKeyFromObjectSync(mainfile, [
                    "keys",
                    keypath_[objpath.object_main.keynames.length],
                ]);
                mainfile.num--;
                mainfile.filekeynum--;
            }
            __1.i.splitterData[this.symbol].actualMainFiles[mainpath] = mainfile;
            __1.i.splitterData[this.symbol].actualFiles[filepath] = newfile;
            if ((this._options.silent?._all || this._options.silent?.deleteKey) &&
                !nosilent)
                return true;
            // @ts-ignore
            return newfile;
        }
        else {
            if (!objpath.dirpath) {
                let err = Error(`could not get maindirectory of specified keypath (keypath: ${keypath})`);
                this.emitError(err);
                return undefined;
            }
            try {
                delete __1.i.splitterData[this.symbol].actualMainFiles[objpath.path_main];
            }
            catch (e) { }
            Object.keys(objpath.dirpaths).forEach((a) => {
                try {
                    delete __1.i.splitterData[this.symbol].actualFiles[a];
                }
                catch (e) { }
            });
            fs_1.default.rmSync(objpath.dirpath, { recursive: true });
            return true;
        }
    };
    addKeysToObjectSync = (object, keys, value) => {
        let keys_ = (0, oberknecht_utils_1.convertToArray)(keys);
        let parentObj = object;
        for (let i = 0; i < keys_.length - 1; i++) {
            let key = keys_[i];
            if (!(key in parentObj))
                parentObj[key] = {};
            parentObj = parentObj[key];
        }
        parentObj[keys_[keys_.length - 1]] = value;
        return object;
    };
    addAppendKeysToObjectSync = (object, keys, value) => {
        let keys_ = (0, oberknecht_utils_1.convertToArray)(keys);
        let oldvalue = this.getKeyFromObjectSync(object, keys_);
        let newvalue = oldvalue ?? value;
        switch ((0, oberknecht_utils_1.extendedTypeof)(oldvalue)) {
            case "json": {
                let jsonpaths = this.getKeyArraysFromObject(value);
                jsonpaths.forEach((a) => {
                    this.addKeysToObjectSync(newvalue, a.path, a.value);
                });
                break;
            }
            case "array": {
                newvalue.push(...(0, oberknecht_utils_1.convertToArray)(value));
                break;
            }
            case "string":
            case "number":
            case "bigint": {
                newvalue += value;
                break;
            }
        }
        this.addKeysToObjectSync(object, keys_, newvalue);
        return object;
    };
    getKeyFromObjectSync = (object, keys, emiterr) => {
        let keys_ = (0, oberknecht_utils_1.convertToArray)(keys);
        let value = object;
        for (let i = 0; i < keys_.length; i++) {
            if (value.hasOwnProperty(keys_[i])) {
                value = value[keys_[i]];
            }
            else {
                let err = Error(`key ${keys_[i]} not in value`);
                if (emiterr)
                    this.emitError(err);
                return undefined;
            }
        }
        return value;
    };
    deleteKeyFromObjectSync = (object, keys, emiterr) => {
        let keys_ = (0, oberknecht_utils_1.convertToArray)(keys);
        let parentObj = object;
        for (let i = 0; i < keys_.length - 1; i++) {
            if (!(keys_[i] in parentObj)) {
                let err = Error(`key ${keys_[i]} not in object`);
                if (emiterr)
                    this.emitError(err);
                return undefined;
            }
            else {
                parentObj = parentObj[keys_[i]];
            }
        }
        let delkey = keys_[keys_.length - 1];
        delete parentObj[delkey];
        return object;
    };
    // ↓ Asynchronus functions ↓
    addKeysToObject = async (object, keys, value) => {
        return new Promise((resolve) => {
            let keys_ = (0, oberknecht_utils_1.convertToArray)(keys);
            let parentObj = object;
            for (let i = 0; i < keys_.length - 1; i++) {
                let key = keys_[i];
                if (!(key in parentObj))
                    parentObj[key] = {};
                parentObj = parentObj[key];
            }
            parentObj[keys_[keys_.length - 1]] = value;
            return resolve(object);
        });
    };
    addAppendKeysToObject = async (object, keys, value) => {
        return new Promise(async (resolve, reject) => {
            let keypath_ = (0, oberknecht_utils_1.convertToArray)(keys);
            let objpath = this.getFileByKeys(keypath_);
            this.addAppendKeysToObjectSync(object, keypath_, value);
            return resolve(object);
        });
    };
    getKeyFromObject = async (object, keys, noreject) => {
        return new Promise((resolve, reject) => {
            let keys_ = (0, oberknecht_utils_1.convertToArray)(keys);
            let value = object;
            for (let i = 0; i < keys_.length; i++) {
                if (value.hasOwnProperty(keys_[i])) {
                    value = value[keys_[i]];
                }
                else {
                    let err = Error(`key ${keys_[i]} not in value`);
                    this.emitError(err);
                    if (noreject)
                        return resolve(undefined);
                    return reject(err);
                }
            }
            return resolve(value);
        });
    };
    deleteKeyFromObject = async (object, keys, noreject) => {
        return new Promise((resolve, reject) => {
            let keys_ = (0, oberknecht_utils_1.convertToArray)(keys);
            let parentObj = object;
            for (let i = 0; i < keys_.length - 1; i++) {
                if (!(keys_[i] in parentObj)) {
                    let err = Error(`key ${keys_[i]} not in object`);
                    this.emitError(err);
                    if (noreject)
                        return resolve(undefined);
                    return reject({ error: err });
                }
                else {
                    parentObj = parentObj[keys_[i]];
                }
            }
            let delkey = keys_[keys_.length - 1];
            delete parentObj[delkey];
            return resolve(object);
        });
    };
    getMainPath = (keypath) => {
        let keypath_ = (0, oberknecht_utils_1.convertToArray)(keypath);
        return (0, _mainpath_1._mainpath)(this.symbol, [
            ...keypath_.slice(0, keypath_.length > this._options.max_keys_in_file
                ? this._options.max_keys_in_file
                : keypath_.length - 1),
            "_main.json",
        ]);
    };
    getMainKey = async (keypath, noreject) => {
        this.addAction(`getMainKey`);
        return new Promise(async (resolve, reject) => {
            let objpath = this.getFileByKeys(keypath);
            if (!objpath.object_main) {
                let err = Error(`objpath.object_main is undefined (keypath: ${keypath}, noreject: ${noreject})`);
                this.emitError(err);
                if (noreject)
                    return resolve(undefined);
                return reject(err);
            }
            this.getKeyFromObject(objpath.object_main, keypath.slice(1))
                .then((mainkey) => {
                return resolve(mainkey);
            })
                .catch((e) => {
                let err = Error(`could not get key ${keypath[keypath.length - 1]} from mainfile keys (keypath: ${keypath}, noreject: ${noreject})`, { cause: e });
                this.emitError(err);
                if (noreject)
                    return resolve(undefined);
                return reject(err);
            });
        });
    };
    getKey = async (keypath, noreject) => {
        this.addAction(`getKey`);
        return new Promise(async (resolve, reject) => {
            let keypath_ = (0, oberknecht_utils_1.convertToArray)(keypath);
            let objpath = this.getFileByKeys(keypath_);
            if (keypath_.length > 1) {
                if (!objpath.keyfound) {
                    let err = Error(`objpath.keyfound is false (keypath: ${keypath_}, noreject: ${noreject})`);
                    this.emitError(err);
                    if (noreject)
                        return resolve(undefined);
                    return reject(err);
                }
                this.getKeyFromObject(objpath.object, keypath_, noreject)
                    .then(resolve)
                    .catch((e) => {
                    let err = Error(`could not get key (path = keypath) from file (keypath: ${keypath}, noreject: ${noreject})`, { cause: e });
                    this.emitError(err);
                    if (noreject)
                        return resolve(undefined);
                    return reject(err);
                });
            }
            else {
                if (!objpath.object_main) {
                    let err = Error(`objpath.object_main is undefined (keypath: ${keypath_}, noreject: ${noreject})`);
                    this.emitError(err);
                    if (noreject)
                        return resolve(undefined);
                    return reject(err);
                }
                let r = {};
                Promise.all([...Array((objpath.filenum ?? 0) + 1)].map(async (a, i) => {
                    let file = this._files[objpath.path_main.replace(_mainreg, `${i}.json`)]();
                    let objects = await this.getKeyFromObject(file, keypath_);
                    r = { ...r, ...objects };
                })).finally(() => {
                    return resolve(r);
                });
            }
        });
    };
    addKey = async (keypath, value, noreject) => {
        this.addAction(`addKey`);
        return new Promise(async (resolve, reject) => {
            let keypath_ = (0, oberknecht_utils_1.convertToArray)(keypath);
            let objpath = this.getFileByKeys(keypath_);
            if (!objpath.object_main?.num)
                await this.create(await this.addKeysToObject({}, keypath_, value));
            (0, getMainPaths_1.getMainPaths)(this.symbol);
            (0, getMainFiles_1.getMainFiles)(this.symbol);
            objpath = this.getFileByKeys(keypath_);
            let mainpath = objpath.path_main;
            let filepath = objpath.path;
            let file = objpath.object;
            if (objpath.object_main.filekeynum ==
                objpath.object_main.keynames.length + 1) {
                if (objpath.object_main.filekeynum >= this._options.max_keys_in_file) {
                    objpath.object_main.filenum++;
                    objpath.object_main.filekeynum = 0;
                    filepath = objpath.path_main.replace(_mainreg, `${objpath.object_main.filenum}.json`);
                    __1.i.splitterData[this.symbol].paths[filepath] = filepath
                        .replace((0, _mainpath_1._mainpath)(this.symbol), "")
                        .replace(slashreg, "");
                    (0, _wf_1._wf)(this.symbol, filepath, this.createObjectFromKeys(objpath.object_main.keynames, {}));
                    file = this._files[filepath];
                    if (!objpath.object_main.hasChanges)
                        objpath.object_main.hasChanges = [];
                    if (!objpath.object_main.hasChanges.includes(filepath))
                        objpath.object_main.hasChanges.push(filepath);
                    objpath.object_main.hasChanges.push(filepath);
                    __1.i.splitterData[this.symbol].actualMainFiles[mainpath] =
                        objpath.object_main;
                }
            }
            if (this.getKeyFromObjectSync(objpath.object_main, [
                "keys",
                objpath.keys[1],
            ]) === undefined) {
                objpath.object_main.num++;
                objpath.object_main.filekeynum++;
            }
            this.addKeysToObject(objpath.object_main, ["keys", objpath.keys[1]], objpath.object_main.filenum)
                .then((newmainfile) => {
                this.addKeysToObject(file, keypath_, value)
                    .then(async (newfile) => {
                    __1.i.splitterData[this.symbol].actualFiles[filepath] = newfile;
                    if (!newmainfile.hasChanges)
                        newmainfile.hasChanges = [];
                    if (!newmainfile.hasChanges.includes(filepath))
                        newmainfile.hasChanges.push(filepath);
                    __1.i.splitterData[this.symbol].actualMainFiles[mainpath] = newmainfile;
                    newmainfile.keynum++;
                    newmainfile.filekeynum++;
                    if (this._options.silent?._all || this._options.silent?.addKey)
                        return resolve();
                    return resolve(newfile);
                })
                    .catch((e) => {
                    let err = Error(`could not add key (path = keypath) to file (keypath: ${keypath}, noreject: ${noreject})`, { cause: e });
                    this.emitError(err);
                    if (noreject)
                        return resolve(undefined);
                    return reject(err);
                });
            })
                .catch((e) => {
                let err = Error(`could not add key ${objpath.keys[1]} to mainfile keys (keypath: ${keypath}, noreject: ${noreject})`, { cause: e });
                this.emitError(err);
                if (noreject)
                    return resolve(undefined);
                return reject(err);
            });
        });
    };
    editKey = async (keypath, value, noreject) => {
        this.addAction(`editKey`);
        return new Promise(async (resolve, reject) => {
            let keypath_ = (0, oberknecht_utils_1.convertToArray)(keypath);
            let objpath = this.getFileByKeys(keypath_);
            let mainpath = objpath.path_main;
            let filepath = objpath.path;
            if (!objpath.object) {
                let err = Error(`file is undefined - could not get key from mainobject keys (keypath: ${keypath}, noreject: ${noreject})`);
                this.emitError(err);
                if (noreject)
                    return resolve(undefined);
                return reject(err);
            }
            if (this.getKeyFromObjectSync(objpath.object_main, [
                "keys",
                keypath_[1],
            ]) === undefined) {
                let newfile = this.addKeySync(keypath_, value);
                if (!objpath.object_main.hasChanges)
                    objpath.object_main.hasChanges = [];
                if (!objpath.object_main.hasChanges.includes(filepath))
                    objpath.object_main.hasChanges.push(filepath);
                __1.i.splitterData[this.symbol].actualMainFiles[mainpath] =
                    objpath.object_main;
                if (this._options.silent?._all || this._options.silent?.editKey)
                    return resolve();
                return resolve(newfile);
            }
            else {
                this.addKeysToObject(objpath.object, keypath_, value)
                    .then((newfile) => {
                    __1.i.splitterData[this.symbol].actualFiles[filepath] = newfile;
                    if (!objpath.object_main.hasChanges)
                        objpath.object_main.hasChanges = [];
                    if (!objpath.object_main.hasChanges.includes(filepath))
                        objpath.object_main.hasChanges.push(filepath);
                    __1.i.splitterData[this.symbol].actualMainFiles[mainpath] =
                        objpath.object_main;
                    if (this._options.silent?._all || this._options.silent?.editKey)
                        return resolve();
                    return resolve(newfile);
                })
                    .catch((e) => {
                    let err = Error(`could not add key (path: ${keypath_.slice(0, keypath_.length - 2)}) to object (keypath: ${keypath}, noreject: ${noreject})`, { cause: e });
                    this.emitError(err);
                    if (noreject)
                        return resolve(undefined);
                    return reject(err);
                });
            }
        });
    };
    /** Adds value to the key given (new value = <old value> + <value>) */
    editKeyAdd = async (keypath, value, noreject) => {
        this.addAction(`editKeyAdd`);
        return new Promise(async (resolve, reject) => {
            let keypath_ = (0, oberknecht_utils_1.convertToArray)(keypath);
            let objpath = this.getFileByKeys(keypath_);
            let mainpath = objpath.path_main;
            let filepath = objpath.path;
            if (!objpath.object) {
                let err = Error(`file is undefined - could not get key from mainobject keys (keypath: ${keypath}, noreject: ${noreject})`);
                this.emitError(err);
                if (noreject)
                    return resolve(undefined);
                return reject(err);
            }
            if (this.getKeyFromObjectSync(objpath.object_main, [
                "keys",
                keypath_[1],
            ]) === undefined) {
                let newfile = this.addAppendKeysToObjectSync(objpath.object, keypath_, value);
                __1.i.splitterData[this.symbol].actualFiles[filepath] = newfile;
                if (!objpath.object_main.hasChanges)
                    objpath.object_main.hasChanges = [];
                if (!objpath.object_main.hasChanges.includes(filepath))
                    objpath.object_main.hasChanges.push(filepath);
                __1.i.splitterData[this.symbol].actualMainFiles[mainpath] =
                    objpath.object_main;
                if (this._options.silent?._all || this._options.silent?.editKey)
                    return resolve();
                return resolve(newfile);
            }
            else {
                this.addAppendKeysToObject(objpath.object, keypath_, value)
                    .then((newfile) => {
                    __1.i.splitterData[this.symbol].actualFiles[filepath] = newfile;
                    if (!objpath.object_main.hasChanges)
                        objpath.object_main.hasChanges = [];
                    if (!objpath.object_main.hasChanges.includes(filepath))
                        objpath.object_main.hasChanges.push(filepath);
                    __1.i.splitterData[this.symbol].actualMainFiles[mainpath] =
                        objpath.object_main;
                    if (this._options.silent?._all || this._options.silent?.editKeyAdd)
                        return resolve();
                    return resolve(newfile);
                })
                    .catch((e) => {
                    let err = Error(`could not add key (path: ${keypath_.slice(0, keypath_.length - 2)}) to object (keypath: ${keypath}, noreject: ${noreject})`, { cause: e });
                    this.emitError(err);
                    if (noreject)
                        return resolve(undefined);
                    return reject(err);
                });
            }
        });
    };
    deleteKey = async (keypath, noreject) => {
        this.addAction(`deleteKey`);
        return new Promise(async (resolve, reject) => {
            let keypath_ = (0, oberknecht_utils_1.convertToArray)(keypath);
            let objpath = this.getFileByKeys(keypath_);
            if (!objpath.object_main) {
                let err = Error(`objpath.object_main is undefined (keypath: ${keypath_}, noreject: ${noreject})`);
                this.emitError(err);
                if (noreject)
                    return resolve(undefined);
                return reject(err);
            }
            let mainpath = objpath.path_main;
            let filepath = objpath.path_main.replace(_mainreg, `${objpath.filenum}.json`);
            let file = objpath.object;
            if (keypath_.length >
                (objpath.object_main?.keynames?.length ??
                    this._options?.max_keys_in_file)) {
                this.deleteKeyFromObject(file, keypath_)
                    .then(async (newfile) => {
                    file = __1.i.splitterData[this.symbol].actualFiles[filepath] = newfile;
                    let mainfile = objpath.object_main;
                    if (!mainfile.hasChanges)
                        mainfile.hasChanges = [];
                    if (!mainfile.hasChanges.includes(filepath))
                        mainfile.hasChanges.push(filepath);
                    if (keypath_.length == objpath.object_main.keynames.length + 1) {
                        await this.deleteKeyFromObject(mainfile, [
                            "keys",
                            keypath_[objpath.object_main.keynames.length],
                        ]);
                        mainfile.num--;
                        mainfile.filekeynum--;
                    }
                    __1.i.splitterData[this.symbol].actualMainFiles[mainpath] = mainfile;
                    if (this._options.silent?._all || this._options.silent?.deleteKey)
                        return resolve();
                    return resolve(file);
                })
                    .catch((e) => {
                    let err = Error(`could not delete key from file (keypath: ${keypath}, noreject: ${noreject})`, { cause: e });
                    this.emitError(err);
                    if (noreject)
                        return resolve(undefined);
                    return reject(err);
                });
            }
            else {
                if (!objpath.dirpath) {
                    let err = Error(`could not get maindirectory of specified keypath (keypath: ${keypath}, noreject: ${noreject})`);
                    this.emitError(err);
                    if (noreject)
                        return resolve(undefined);
                    return reject(err);
                }
                try {
                    delete __1.i.splitterData[this.symbol].actualMainFiles[objpath.path_main];
                }
                catch (e) { }
                Object.keys(objpath.dirpaths).forEach((a) => {
                    try {
                        delete __1.i.splitterData[this.symbol].actualFiles[a];
                    }
                    catch (e) { }
                });
                fs_1.default.rmSync(objpath.dirpath, { recursive: true });
                return resolve();
            }
        });
    };
}
exports.jsonsplitter = jsonsplitter;
