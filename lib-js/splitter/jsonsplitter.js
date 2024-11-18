"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.jsonsplitter = void 0;
const oberknecht_emitters_1 = require("oberknecht-emitters");
const oberknecht_utils_1 = require("oberknecht-utils");
const child_process_1 = __importDefault(require("child_process"));
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
const checkSize_1 = require("../functions/checkSize");
const getKeysPaths_1 = require("../functions/getKeysPaths");
const getKeysFiles_1 = require("../functions/getKeysFiles");
const getKeysForMainFile_1 = require("../functions/getKeysForMainFile");
const moveToKeysFiles_1 = require("../functions/moveToKeysFiles");
const getKeyFromKeysFiles_1 = require("../functions/getKeyFromKeysFiles");
const addKeyToFileKeys_1 = require("../functions/addKeyToFileKeys");
const removeKeyFromKeysFile_1 = require("../functions/removeKeyFromKeysFile");
const createBackup_1 = require("../functions/createBackup");
const slashreg = /^\/|\/$/g;
const _mainreg = /_main\.json$/;
let clientSymNum = 0;
class jsonsplitter {
    #symbol = `jsonsplitter-${clientSymNum++}`;
    get symbol() {
        return this.#symbol;
    }
    oberknechtEmitter = new oberknecht_emitters_1.oberknechtEmitter();
    get _mainPaths() {
        return __1.i.splitterData[this.symbol]?.mainPaths ?? (0, getMainPaths_1.getMainPaths)(this.symbol);
    }
    get _mainFiles() {
        return __1.i.splitterData[this.symbol]?.mainFiles ?? (0, getMainFiles_1.getMainFiles)(this.symbol);
    }
    get _keysPaths() {
        return __1.i.splitterData[this.symbol]?.keysPaths ?? (0, getKeysPaths_1.getKeysPaths)(this.symbol);
    }
    get _keysFiles() {
        return __1.i.splitterData[this.symbol]?.keysFiles ?? (0, getKeysFiles_1.getKeysFiles)(this.symbol);
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
    loadTimes = [];
    constructor(options_) {
        const loadStart = Date.now();
        let options = (options_ ?? {});
        options.child_folders_keys = options?.child_folders_keys ?? 1;
        options.max_keys_in_file = options?.max_keys_in_file ?? 3000;
        options.startpath = options?.startpath
            ? options.startpath.startsWith("/")
                ? options?.startpath
                : (0, _mainpath_1._mainpath)(options.startpath)
            : (0, _mainpath_1._mainpath)("./data");
        options.debug = options.debug ?? 2;
        options.cacheSettings = options.cacheSettings ?? {};
        options.cacheSettings.maxFileCacheAge =
            options.cacheSettings.maxFileCacheAge ?? 600000;
        options.cacheSettings.maxMainFileCacheAge =
            options.cacheSettings.maxMainFileCacheAge ?? 600000;
        options.backupDir = (0, _mainpath_1._mainpath)(this.symbol, options.backupDir);
        options.backupPath = (0, _mainpath_1._mainpath)(this.symbol, [
            options.backupDir,
            options.backupPath ?? options.startpath.split("/").at(-1) + "-backups",
        ]);
        switch (options.backupInterval) {
            case "hourly": {
                options.backupInterval = 60 * 60 * 1000;
                break;
            }
            case "daily": {
                options.backupInterval = 24 * 60 * 60 * 1000;
                break;
            }
            case "weekly": {
                options.backupInterval = 7 * 24 * 60 * 60 * 1000;
                break;
            }
            default: {
                if (typeof options.backupInterval === "number") {
                    options.backupInterval = options.backupInterval;
                }
                else {
                    options.backupInterval = 7 * 24 * 60 * 60 * 1000;
                }
            }
        }
        if (options.debug >= 0)
            (0, _log_1._log)(1, `[${this.symbol.toUpperCase()}] Initializing \t${this.symbol} \tDirectory: ${options.startpath}`);
        __1.i.splitterData[this.symbol] = {
            actualFiles: {},
            actualMainFiles: {},
            actualKeysFiles: {},
        };
        this.oberknechtEmitter._options = options.emitterOptions;
        this._options = __1.i.splitterData[this.symbol]._options = options;
        if (options.resetOnStart)
            fs_1.default.rm(options.startpath, { recursive: true }, () => { });
        (0, _cdir_1._cdir)(this.symbol, options.startpath);
        __1.i.oberknechtEmitter[this.symbol] = this.oberknechtEmitter;
        // process.on("unhandledRejection", e => this.oberknechtEmitter.emitError("unhandledRejection", e));
        // process.on("uncaughtException", e => this.oberknechtEmitter.emitError("uncaughtException", e));
        (0, getMainFiles_1.getMainFiles)(this.symbol);
        (0, getFiles_1.getFiles)(this.symbol);
        (0, getKeysFiles_1.getKeysFiles)(this.symbol);
        if (options.preloadKeysFiles) {
            const preloadStart = Date.now();
            if (options.debug >= 0)
                (0, _log_1._log)(1, `[${this.symbol.toUpperCase()}] Preloading ${Object.keys(this._keysFiles).length} Keys Files`);
            Object.keys(this._keysFiles).forEach((a) => {
                this._keysFiles[a]();
            });
            if (options.debug >= 0)
                (0, _log_1._log)(1, `[${this.symbol.toUpperCase()}] Preloaded ${Object.keys(this._keysFiles).length} Keys Files (Took ${(0, oberknecht_utils_1.cleanTime)(Date.now() - preloadStart, 4
                // @ts-ignore
                ).time.join(" and ")})`);
        }
        __1.i.splitterData[this.symbol].filechangeInterval = setInterval(() => {
            (0, fileChange_1.fileChange)(this.symbol, true);
        }, options.filechange_interval ?? 15000);
        if (!options.cacheSettings.noAutoClearCacheSmart)
            __1.i.splitterData[this.symbol].clearCacheInterval = setInterval(async () => {
                await this.save();
                (0, clearCacheSmart_1.clearCacheSmart)(this.symbol);
            }, [options.cacheSettings.autoClearInterval, options.cacheSettings.maxFileCacheAge, options.cacheSettings.maxMainFileCacheAge].filter((a) => a).sort()[0]);
        if (options.backupEnabled) {
            if (options.backupOnStart)
                (0, createBackup_1.createBackup)(this.symbol);
            __1.i.splitterData[this.symbol].backupInterval = setInterval(() => {
                (0, createBackup_1.createBackup)(this.symbol);
            }, options.backupInterval);
        }
        const loadEnd = Date.now();
        if (options.debug >= 0)
            (0, _log_1._log)(1, `[${this.symbol.toUpperCase()}] Initialized \t${this.symbol} \tDirectory: ${options.startpath} (Took ${loadEnd - loadStart} ms)`);
        try {
            child_process_1.default.execSync("zip -v");
        }
        catch (e) {
            (0, _log_1._log)(2, Error("Could not find command zip - if you're using the backupZip option make sure to install it using\n\t\tsudo apt install zip\n\t\t" +
                "and restart this process. Until then, jsonsplitter will create normal unzipped backups."));
        }
    }
    addAction = (action, args) => {
        if (!__1.i.splitterData[this.symbol].actions)
            __1.i.splitterData[this.symbol].actions = [];
        __1.i.splitterData[this.symbol].actions = __1.i.splitterData[this.symbol].actions.slice(0, 50);
        __1.i.splitterData[this.symbol].actions.push([Error(action), args]);
        this._options.actionCallback?.(action, args);
    };
    on = (type, callback) => {
        return this.oberknechtEmitter.on(type, callback);
    };
    onError = (callback) => {
        return this.oberknechtEmitter.on("error", callback);
    };
    emit = (eventname, args) => {
        return this.oberknechtEmitter.emit(eventname, args);
    };
    emitError = (e) => {
        return this.oberknechtEmitter.emitError("error", e);
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
                // .slice(0, dp.split("/").length - rp.split("/").length + 1)
                .slice(0, this._options.max_keys_in_file)
                .join("/"),
            rp,
            // dp
            // .split("/")
            // .slice(dp.split("/").length - rp.split("/").length + 1)
            // .slice(0, this._options.max_keys_in_file)
            // .join("/"),
            dp
                .split("/")
                // .slice(0, dp.split("/").length - rp.split("/").length + 1)
                .slice(0, this._options.max_keys_in_file)
                .join("/") + "/_main.json",
        ];
    };
    createObjectFromKeys = (keys, value) => {
        let o = {};
        let keys_ = (0, oberknecht_utils_1.convertToArray)(keys);
        function actualAppend(i, o2) {
            o2[keys_[i]] = {};
            if (i < keys_.length - 1)
                actualAppend(i + 1, o2[keys_[i]]);
            else
                o2[keys_[i]] = value;
        }
        actualAppend(0, o);
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
            leftkeys: undefined,
            keynamesmatched: false,
        };
        let lastI = 0;
        let keynamesmatched = false;
        const keypath_ = (0, oberknecht_utils_1.convertToArray)(keypath);
        for (let i = 0; i < keypath_.length; i++) {
            let dirpathkeys = this.getDirPathsByKeys(keypath_.slice(0, i + 1));
            let filteredkeypath = Object.keys(this._mainPaths).filter((b) => new RegExp(`^${dirpathkeys[0]}\/_main\.json$`).test(b));
            if ((filteredkeypath.length ?? 0) > 0) {
                r.path_main = filteredkeypath[0];
                r.object_main = this._mainFiles[r.path_main];
                r.dirpath = dirpathkeys[1];
                r.dirpaths = Object.keys(this._paths).filter((a) => a.startsWith(r.dirpath));
                r.filenum = r.object_main().filenum;
                let filenum_ = (0, getKeyFromKeysFiles_1.getKeyFromKeysFiles)(this.symbol, keypath_, true);
                let keynamesmatch = r.object_main()?.keynames?.join("\u0001") ===
                    keypath_.slice(0, i + 1).join("\u0001");
                if (!(0, oberknecht_utils_1.isNullUndefined)(filenum_.value) || keynamesmatch) {
                    if (!(0, oberknecht_utils_1.isNullUndefined)(filenum_.value))
                        r.filenum = filenum_.value;
                    r.keyfound = true;
                    if (keynamesmatch)
                        keynamesmatched = true;
                }
                r.path = (0, oberknecht_utils_1.isNullUndefined)(filenum_.value)
                    ? r.path_main.replace(_mainreg, `${r.object_main().filenum}.json`)
                    : (0, _mainpath_1._mainpath)(this.symbol, [
                        `${keypath_
                            .slice(0, this._options.child_folders_keys)
                            .join("/")}/${filenum_.value}.json`,
                    ]);
                r.object = this._files[r.path];
                i = keypath_.length;
            }
            else {
                lastI++;
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
                return keypath_;
            },
            dirpath: r.dirpath,
            dirpaths: r.dirpaths,
            keyfound: r.keyfound,
            filenum: r.filenum,
            leftkeys: keypath_.slice(0, lastI + 1),
            keynamesmatched: keynamesmatched,
        };
    };
    createSync = (object) => {
        let this_ = this;
        let objdir = this.getDirPathsByObject(object);
        function actualCreate(obj) {
            (0, _cdir_1._cdir)(this_.symbol, (0, _mainpath_1._mainpath)(this_.symbol, [...obj.path]));
            let objmainpath = (0, _mainpath_1._mainpath)(this_.symbol, [...obj.path, "_main.json"]);
            let objmain = {};
            let keychunks = (0, oberknecht_utils_1.chunkArray)(Object.keys(obj.object), this_._options.max_keys_in_file);
            objmain.filenum = 0;
            objmain.filekeynum = 0;
            objmain.num = 0;
            objmain.keys = {};
            objmain.keynames = obj.path;
            if (keychunks.length === 0)
                (0, _wf_1._wf)(this_.symbol, (0, _mainpath_1._mainpath)(this_.symbol, [...obj.path, `0.json`]), this_.createObjectFromKeys(obj.path, {}));
            keychunks.forEach((keychunk, i) => {
                let keychunk_ = {};
                objmain.num += keychunk.length;
                objmain.filekeynum = keychunk.length;
                objmain.filenum = i;
                objmain.keys = {};
                keychunk.forEach((a) => {
                    keychunk_[a] = obj.object[a];
                    objmain.keys[a] = i;
                });
                let chunkfile = this_.createObjectFromKeys(obj.path, keychunk_);
                (0, _wf_1._wf)(this_.symbol, (0, _mainpath_1._mainpath)(this_.symbol, [...obj.path, `${i}.json`]), chunkfile);
            });
            (0, _wf_1._wf)(this_.symbol, objmainpath, objmain);
            // this_.recreateMainFiles();
            (0, moveToKeysFiles_1.moveToKeysFiles)(this_.symbol, objmainpath);
        }
        function fromArr(a) {
            if (!Array.isArray(a))
                return actualCreate(a);
            a.forEach((b) => {
                if (Array.isArray(b))
                    return fromArr(b);
                actualCreate(b);
            });
        }
        fromArr(objdir);
        (0, getMainFiles_1.getMainFiles)(this.symbol);
        (0, getFiles_1.getFiles)(this.symbol);
        return objdir;
    };
    create = (object) => {
        this.createSync(object);
        return this.recreateMainFiles();
    };
    createBackup = () => {
        return (0, createBackup_1.createBackup)(this.symbol);
    };
    getMainKeySync = (keypath) => {
        this.addAction(`getMainKeySync`);
        let objpath = this.getFileByKeys(keypath);
        if (!objpath.object_main) {
            let err = Error(`objpath.object_main is undefined (keypath: ${keypath})`);
            this.emitError(err);
            return undefined;
        }
        return this.getKeyFromObjectSync(objpath.object_main, keypath.slice(this._options.child_folders_keys));
    };
    getKeySync = (keypath, emitErr, returnRecreate) => {
        this.addAction(`getKeySync`);
        let start = Date.now();
        let keypath_ = (0, oberknecht_utils_1.convertToArray)(keypath);
        let objpath = this.getFileByKeys(keypath_);
        let end = Date.now();
        oberknecht_utils_1.arrayModifiers.push(this.loadTimes, [["getKeySync", end - start, Date.now()]], 50);
        if (keypath_.length > (objpath.object_main?.keynames?.length ?? 0)) {
            if (!objpath.keyfound) {
                let err = Error(`objpath.keyfound is false (keypath: ${keypath_})`);
                if (emitErr)
                    this.emitError(err);
                return undefined;
            }
            if (!objpath.keyfound && objpath.keynamesmatched) {
                let r_ = (0, getKeysForMainFile_1.getKeysForMainFile)(this.symbol, objpath.path_main);
                return returnRecreate ? (0, oberknecht_utils_1.recreate)(r_) : r_;
            }
            let value = this.getKeyFromObjectSync(objpath.object, keypath_);
            this.oberknechtEmitter.emit(["getKeySync"], {
                keyPath: keypath_,
                objpath: objpath,
                value: value,
            });
            return returnRecreate ? (0, oberknecht_utils_1.recreate)(value) : value;
        }
        else {
            if (!objpath.object_main) {
                let err = Error(`objpath.object_main is undefined (keypath: ${keypath_})`);
                if (emitErr)
                    this.emitError(err);
                return undefined;
            }
            let r = {};
            objpath.dirpaths
                .filter((a) => /.+\/\d+\.json$/.test(a))
                .forEach((a, i) => {
                let file = this._files[a]();
                let objects = this.getKeyFromObjectSync(file, objpath.leftkeys, emitErr);
                if (objects)
                    r = (0, oberknecht_utils_1.concatJSON)([r, objects]);
            });
            return returnRecreate ? (0, oberknecht_utils_1.recreate)(r) : r;
        }
    };
    addKeySync = (keypath, value, nosilent, newFile) => {
        this.addAction(`addKeySync`);
        let keypath_ = (0, oberknecht_utils_1.convertToArray)(keypath);
        let objpath = this.getFileByKeys(keypath_);
        if ((0, oberknecht_utils_1.isNullUndefined)(objpath.object_main?.num)) {
            this.createSync(this.addKeysToObjectSync({}, keypath_, value));
            (0, getMainPaths_1.getMainPaths)(this.symbol);
            (0, getMainFiles_1.getMainFiles)(this.symbol);
            return;
        }
        objpath = this.getFileByKeys(keypath_);
        let mainpath = objpath.path_main;
        let filepath = objpath.path;
        let file;
        file = (0, oberknecht_utils_1.recreate)(objpath.object);
        if (newFile ||
            keypath_.length === (objpath.object_main?.keynames?.length ?? 0) + 1) {
            if (objpath.object_main.filekeynum >= this._options.max_keys_in_file ||
                (0, checkSize_1.checkSize)(this.symbol, (0, oberknecht_utils_1.recreate)(file), (0, oberknecht_utils_1.addKeysToObject)({}, keypath_, value)) ||
                newFile) {
                objpath.object_main.filenum++;
                objpath.object_main.filekeynum = 0;
                filepath = objpath.path_main.replace(_mainreg, `${objpath.object_main.filenum}.json`);
                __1.i.splitterData[this.symbol].paths[filepath] = filepath
                    .replace((0, _mainpath_1._mainpath)(this.symbol), "")
                    .replace(slashreg, "");
                (0, _wf_1._wf)(this.symbol, filepath, this.addKeysToObjectSync(this.createObjectFromKeys(objpath.object_main.keynames, {}), keypath_, value));
                file = (0, oberknecht_utils_1.recreate)(this._files[filepath]());
            }
        }
        if (this.getKeySync(keypath_) === undefined) {
            objpath.object_main.num++;
            objpath.object_main.filekeynum++;
        }
        this.addKeyToFileKeys(keypath_, objpath.keys[objpath.object_main.keynames.length], objpath.object_main.filenum);
        let newfile = this.addKeysToObjectSync(file, keypath_, value);
        __1.i.splitterData[this.symbol].actualFiles[filepath] = newfile;
        this.addHasChanges(objpath.path_main, filepath);
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
        let filePath = objpath.path;
        let newfile;
        if (!objpath.object ||
            this.getKeyFromObjectSync(objpath.object_main, [
                "keys",
                keypath_[objpath.object_main.keynames.length],
            ]) === undefined) {
            newfile = (0, oberknecht_utils_1.recreate)(this.addKeySync(keypath_, value, nosilent));
        }
        else {
            let noAppendNewFile = false;
            if ((0, checkSize_1.checkSize)(this.symbol, (0, oberknecht_utils_1.recreate)(objpath.object), (0, oberknecht_utils_1.addKeysToObject)({}, keypath_, value))) {
                this.deleteKeySync(keypath_);
                newfile = (0, oberknecht_utils_1.recreate)(this.addKeySync(keypath_, value, true, true));
                noAppendNewFile = true;
            }
            else {
                newfile = this.addKeysToObjectSync(objpath.object, keypath_, value);
                this.oberknechtEmitter.emit(["editKeySync", "_change"], {
                    keyPath: keypath_,
                    objpath: objpath,
                    value: value,
                });
            }
            this.addHasChanges(objpath.path_main, filePath);
            if (!noAppendNewFile) {
                __1.i.splitterData[this.symbol].actualFiles[filePath] = newfile;
            }
        }
        if ((this._options.silent?._all || this._options.silent?.editKey) &&
            !nosilent)
            return true;
        return newfile;
    };
    editKeyAddSync = (keypath, value, nosilent) => {
        this.addAction(`editKeyAddSync`);
        let keypath_ = (0, oberknecht_utils_1.convertToArray)(keypath);
        let objpath = this.getFileByKeys(keypath_);
        let mainpath = objpath.path_main;
        let filepath = objpath.path;
        let newfile;
        if (!objpath.object || this.getKeySync(keypath_) === undefined) {
            newfile = this.addKeySync(keypath_, value, true);
        }
        else {
            let noAppendNewFile = false;
            if ((0, checkSize_1.checkSize)(this.symbol, (0, oberknecht_utils_1.recreate)(objpath.object), this.addAppendKeysToObjectSync(objpath.object, keypath_, value, true))) {
                let valueNew = this.addAppendKeysToObjectSync(objpath.object, keypath_, value, true);
                this.deleteKeySync(keypath_);
                newfile = this.addKeySync(keypath_, valueNew, true);
                noAppendNewFile = true;
            }
            else {
                newfile = this.addAppendKeysToObjectSync(objpath.object, keypath_, value);
                this.oberknechtEmitter.emit(["editKeyAddSync", "_change"], {
                    keyPath: keypath_,
                    objpath: objpath,
                    value: value,
                });
            }
            this.addHasChanges(objpath.path_main, filepath);
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
            (objpath.object_main?.keynames?.length ??
                this._options?.child_folders_keys)) {
            let newfile = this.deleteKeyFromObjectSync(file, keypath_, emiterr);
            this.oberknechtEmitter.emit(["deleteKeySync", "_change"], {
                keyPath: keypath_,
                objpath: objpath,
            });
            this.addHasChanges(objpath.path_main, filepath);
            if (keypath_.length === objpath.object_main.keynames.length + 1) {
                let mainfile = objpath.object_main;
                (0, removeKeyFromKeysFile_1.removeKeyFromKeysFile)(this.symbol, keypath_);
                mainfile.num--;
                mainfile.filekeynum--;
                this.addHasChanges(objpath.path_main);
                __1.i.splitterData[this.symbol].actualMainFiles[mainpath] = mainfile;
            }
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
    addAppendKeysToObjectSync = (object, keys, value, returnValue) => {
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
        return returnValue ? newvalue : object;
    };
    getKeyFromObjectSync = (object, keys, emiterr) => {
        let keys_ = (0, oberknecht_utils_1.convertToArray)(keys);
        let value = object;
        for (let i = 0; i < keys_.length; i++) {
            if (value?.hasOwnProperty?.(keys_[i])) {
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
                return object;
            }
            else {
                parentObj = parentObj[keys_[i]];
            }
        }
        let delkey = keys_[keys_.length - 1];
        delete parentObj[delkey];
        return object;
    };
    recreateAllSync = () => {
        Object.keys(this._mainFiles).forEach((a) => {
            const mainKeynames = this._mainFiles[a]().keynames;
            const obj = this.addAppendKeysToObjectSync({}, mainKeynames, this.getKeySync(mainKeynames));
            const rmFilePaths = Object.keys(this._files).filter((b) => new RegExp(`^${(0, oberknecht_utils_1.regexEscape)(a.split("/").slice(0, -1).join("/"))}\/\\d+\.json`).test(b));
            [a, ...rmFilePaths].forEach((b) => fs_1.default.rmSync(b));
            this.createSync(obj);
        });
        try {
            this.save();
        }
        catch (e) { }
    };
    addKeyToFileKeys = (keypath, key, fileNum) => {
        let keypath_ = (0, oberknecht_utils_1.convertToArray)(keypath);
        let objpath = this.getFileByKeys(keypath_.slice(0, this._options.child_folders_keys));
        return (0, addKeyToFileKeys_1.addKeyToFileKeys)(this.symbol, objpath.path_main, (0, oberknecht_utils_1.addKeysToObject)({}, ["keys", key], fileNum), false);
    };
    addHasChanges = (mainFilePath, hasChangesPath) => {
        let mainFile = __1.i.splitterData[this.symbol].actualMainFiles[mainFilePath];
        if (!mainFile.hasChanges)
            mainFile.hasChanges = [];
        if (!hasChangesPath)
            mainFile.hasKeyChanges = true;
        else if (!mainFile.hasChanges.includes(hasChangesPath))
            mainFile.hasChanges.push(hasChangesPath);
    };
    recreateMainFiles = async () => {
        return new Promise(async (resolve, reject) => {
            await Promise.all(Object.keys(this._mainFiles).map((mainFilePath) => {
                return (0, moveToKeysFiles_1.moveToKeysFiles)(this.symbol, mainFilePath).then(() => {
                    if (this._options.debug > 3)
                        (0, oberknecht_utils_1.log)(1, `Recreated main file ${mainFilePath} jsonsplitter: ${this.symbol}`);
                });
            }));
            await this.save();
            resolve();
        });
    };
    getMainKeysKeySync = (keypath) => {
        return (0, getKeyFromKeysFiles_1.getKeyFromKeysFiles)(this.symbol, keypath);
    };
}
exports.jsonsplitter = jsonsplitter;
