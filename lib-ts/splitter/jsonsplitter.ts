import { oberknechtEmitter } from "oberknecht-emitters";
import {
  addKeysToObject,
  arrayModifiers,
  chunkArray,
  cleanTime,
  concatJSON,
  convertToArray,
  deleteKeyFromObject,
  extendedTypeof,
  isNullUndefined,
  log,
  recreate,
  regexEscape,
} from "oberknecht-utils";
import { _mainpath } from "../functions/_mainpath";
import { _cdir } from "../functions/_cdir";
import { _wf } from "../functions/_wf";
import { i } from "..";
import { getMainFiles } from "../functions/getMainFiles";
import { getPaths } from "../functions/getPaths";
import { getFiles } from "../functions/getFiles";
import { fileChange } from "../handlers/fileChange";
import { clearCache } from "../functions/clearCache";
import { clearCacheSmart } from "../functions/clearCacheSmart";
import { _log } from "../functions/_log";
import fs from "fs";
import { getMainPaths } from "../functions/getMainPaths";
import { jsonsplitteroptions } from "../types/jsonsplitter.options";
import { onCallback, onErrorCallback } from "../types/callbacks";
import {
  deleteKeySyncrettype,
  fileType,
  getFileByKeysReturn,
  mainFileType,
} from "../types/jsonsplitter";
import { checkSize } from "../functions/checkSize";
import { getKeysPaths } from "../functions/getKeysPaths";
import { getKeysFiles } from "../functions/getKeysFiles";
import { getKeysForMainFile } from "../functions/getKeysForMainFile";
import { moveToKeysFiles } from "../functions/moveToKeysFiles";
import { getKeyFromKeysFiles } from "../functions/getKeyFromKeysFiles";
import { addKeyToFileKeys } from "../functions/addKeyToFileKeys";
import { removeKeyFromKeysFile } from "../functions/removeKeyFromKeysFile";

const slashreg = /^\/|\/$/g;
const _mainreg = /_main\.json$/;

let clientSymNum = 0;

export class jsonsplitter {
  #symbol = `jsonsplitter-${clientSymNum++}`;
  get symbol() {
    return this.#symbol;
  }

  oberknechtEmitter = new oberknechtEmitter();

  get _mainPaths() {
    return i.splitterData[this.symbol]?.mainPaths ?? getMainPaths(this.symbol);
  }
  get _mainFiles() {
    return i.splitterData[this.symbol]?.mainFiles ?? getMainFiles(this.symbol);
  }
  get _keyspaths() {
    return i.splitterData[this.symbol]?.keysPaths ?? getKeysPaths(this.symbol);
  }
  get _keysFiles() {
    return i.splitterData[this.symbol]?.keysFiles ?? getKeysFiles(this.symbol);
  }
  get _paths() {
    return i.splitterData[this.symbol]?.paths ?? getPaths(this.symbol);
  }
  get _files() {
    return i.splitterData[this.symbol]?.files ?? getFiles(this.symbol);
  }
  get _actions() {
    return i.splitterData[this.symbol].actions ?? [];
  }

  _options: jsonsplitteroptions;
  loadTimes = [];

  constructor(options_: jsonsplitteroptions) {
    const loadStart = Date.now();
    let options: jsonsplitteroptions = (options_ ?? {}) as jsonsplitteroptions;
    options.child_folders_keys = options?.child_folders_keys ?? 1;
    options.max_keys_in_file = options?.max_keys_in_file ?? 3000;
    options.startpath = options?.startpath
      ? options.startpath.startsWith("/")
        ? options?.startpath
        : _mainpath(options.startpath)
      : _mainpath("./data");
    _cdir(this.symbol, options.startpath);
    options.debug = options.debug ?? 2;
    options.cacheSettings = options.cacheSettings ?? {};
    options.cacheSettings.maxFileCacheAge =
      options.cacheSettings.maxFileCacheAge ?? 600000;
    options.cacheSettings.maxMainFileCacheAge =
      options.cacheSettings.maxMainFileCacheAge ?? 600000;

    if (options.debug >= 0)
      _log(
        1,
        `[${this.symbol.toUpperCase()}] Initializing \t${
          this.symbol
        } \tDirectory: ${options.startpath}`
      );

    i.splitterData[this.symbol] = {
      actualFiles: {},
      actualMainFiles: {},
      actualKeysFiles: {},
    };

    this._options = i.splitterData[this.symbol]._options = options;

    i.oberknechtEmitter[this.symbol] = this.oberknechtEmitter;

    // process.on("unhandledRejection", e => this.oberknechtEmitter.emitError("unhandledRejection", e));
    // process.on("uncaughtException", e => this.oberknechtEmitter.emitError("uncaughtException", e));

    getMainFiles(this.symbol);
    getFiles(this.symbol);
    getKeysFiles(this.symbol);
    if (options.preloadKeysFiles) {
      const preloadStart = Date.now();
      if (options.debug >= 0)
        _log(
          1,
          `[${this.symbol.toUpperCase()}] Preloading ${
            Object.keys(this._keysFiles).length
          } Keys Files`
        );
      Object.keys(this._keysFiles).forEach((a) => {
        this._keysFiles[a]();
      });
      if (options.debug >= 0)
        _log(
          1,
          `[${this.symbol.toUpperCase()}] Preloaded ${
            Object.keys(this._keysFiles).length
          } Keys Files (Took ${cleanTime(
            Date.now() - preloadStart,
            4
            // @ts-ignore
          ).time.join(" and ")})`
        );
    }

    i.splitterData[this.symbol].filechangeInterval = setInterval(() => {
      fileChange(this.symbol, true);
    }, options.filechange_interval ?? 15000);
    if (!options.cacheSettings.noAutoClearCacheSmart)
      i.splitterData[this.symbol].clearCacheInterval = setInterval(() => {
        clearCacheSmart(this.symbol);
      }, [options.cacheSettings.autoClearInterval, options.cacheSettings.maxFileCacheAge, options.cacheSettings.maxMainFileCacheAge].filter((a) => a).sort()[0]);

    const loadEnd = Date.now();
    if (options.debug >= 0)
      _log(
        1,
        `[${this.symbol.toUpperCase()}] Initialized \t${
          this.symbol
        } \tDirectory: ${options.startpath} (Took ${loadEnd - loadStart} ms)`
      );
  }

  addAction = (action: string, args?: any[]) => {
    if (!i.splitterData[this.symbol].actions)
      i.splitterData[this.symbol].actions = [];
    i.splitterData[this.symbol].actions = i.splitterData[
      this.symbol
    ].actions.slice(0, 50);
    i.splitterData[this.symbol].actions.push([Error(action), args]);
    this._options.actionCallback?.(action, args);
  };

  on = (type: string, callback: typeof onCallback) => {
    return this.oberknechtEmitter.on(type, callback);
  };

  onError = (callback: typeof onErrorCallback) => {
    return this.oberknechtEmitter.on("error", callback);
  };

  emit = (eventname: string | string[], args?: any) => {
    return this.oberknechtEmitter.emit(eventname, args);
  };

  emitError = (e: Error) => {
    return this.oberknechtEmitter.emitError("error", e);
  };

  destroy = async () => {
    return new Promise<void>(async (resolve, reject) => {
      let errors = [];
      try {
        clearInterval(i.splitterData[this.symbol].filechangeInterval);
        if (i.splitterData[this.symbol].clearCacheInterval)
          clearInterval(i.splitterData[this.symbol].clearCacheInterval);
        await fileChange(this.symbol);
        delete i.splitterData[this.symbol];
      } catch (e) {
        errors.push(e);
      }

      return resolve();
    });
  };

  save = async () => {
    return new Promise<void>(async (resolve, reject) => {
      let filechangeIntervalExisted =
        (i.splitterData[this.symbol].filechangeInterval ?? undefined) !==
        undefined;
      if (filechangeIntervalExisted)
        clearInterval(i.splitterData[this.symbol].filechangeInterval);
      await fileChange(this.symbol);
      if (filechangeIntervalExisted)
        i.splitterData[this.symbol].filechangeInterval = setInterval(() => {
          fileChange(this.symbol, true);
        }, this._options.filechange_interval ?? 15000);

      resolve();
    });
  };

  clearCache = (excludeMainFiles?: boolean) => {
    return clearCache(this.symbol, excludeMainFiles);
  };

  clearCacheSmart = (excludeMainFiles?: boolean) => {
    return clearCacheSmart(this.symbol, excludeMainFiles);
  };

  getDirPathsByObject = (o: Record<string, any>, n1?: number): string[][] => {
    function getDirPathByObject(
      o2: Record<string, any>,
      n: number,
      ml: number,
      p: string[],
      ob: jsonsplitter
    ) {
      if (
        n >= ml ||
        Object.keys(o2).filter((a) => typeof o2[a] !== "object").length > 0
      ) {
        ob._options.child_folders_keys = i.splitterData[
          ob.symbol
        ]._options.child_folders_keys = n;
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

    return getDirPathByObject(
      o,
      0,
      n1 ?? this._options.child_folders_keys,
      [],
      this
    );
  };

  getDirPathsByKeys = (keypath: string | string[]): string[] => {
    let dp = _mainpath(this.symbol, convertToArray(keypath).join("/"));
    let rp = dp.split(_mainpath(this.symbol))[1].replace(slashreg, "");
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

  createObjectFromKeys = (
    keys: string | string[],
    value: any
  ): Record<string, any> => {
    let o = {};
    let keys_ = convertToArray(keys);
    function actualAppend(i, o2) {
      o2[keys_[i]] = {};
      if (i < keys_.length - 1) actualAppend(i + 1, o2[keys_[i]]);
      else o2[keys_[i]] = value;
    }

    actualAppend(0, o);

    return o;
  };

  getKeyArrayFromObject = (object: Record<string, any>): string[] => {
    let r = [];
    function go(o2: Record<string, any>) {
      if (Object.keys(o2).length > 0) return;
      r.push(Object.keys(o2)[0]);
      go(o2[Object.keys(o2)[0]]);
    }
    go(object);
    return r;
  };

  getKeyArraysFromObject = (
    object: Record<string, any>
  ): { path: string[]; value: any }[] => {
    let r = [];
    function go(o2: Record<string, any>, arr: string[]) {
      Object.keys(o2).forEach((a) => {
        if (
          extendedTypeof(o2[a]) === "json" &&
          (Object.keys(o2[a]).length ?? 0) > 0
        ) {
          go(o2[a], [...arr, a]);
        } else {
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

  getFileByKeys = (keypath: string | string[]): getFileByKeysReturn => {
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

    const keypath_ = convertToArray(keypath);

    for (let i = 0; i < keypath_.length; i++) {
      let dirpathkeys = this.getDirPathsByKeys(keypath_.slice(0, i + 1));
      let filteredkeypath = Object.keys(this._mainPaths).filter((b) =>
        new RegExp(`^${dirpathkeys[0]}\/_main\.json$`).test(b)
      );

      if ((filteredkeypath.length ?? 0) > 0) {
        r.path_main = filteredkeypath[0];
        r.object_main = this._mainFiles[r.path_main];
        r.dirpath = dirpathkeys[1];
        r.dirpaths = Object.keys(this._paths).filter((a) =>
          a.startsWith(r.dirpath)
        );
        r.filenum = r.object_main().filenum;

        let filenum_ = getKeyFromKeysFiles(this.symbol, keypath_, true);
        let keynamesmatch =
          r.object_main()?.keynames?.join("\u0001") ===
          keypath_.slice(0, i + 1).join("\u0001");

        if (!isNullUndefined(filenum_.value) || keynamesmatch) {
          if (!isNullUndefined(filenum_.value)) r.filenum = filenum_.value;
          r.keyfound = true;
          if (keynamesmatch) keynamesmatched = true;
        }
        r.path = isNullUndefined(filenum_.value)
          ? r.path_main.replace(_mainreg, `${r.object_main().filenum}.json`)
          : _mainpath(this.symbol, [
              `${keypath_
                .slice(0, this._options.child_folders_keys)
                .join("/")}/${filenum_.value}.json`,
            ]);
        r.object = this._files[r.path];
        i = keypath_.length;
      } else {
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

  createSync = (object: Record<string, any>) => {
    let this_ = this;
    let objdir = this.getDirPathsByObject(object);

    function actualCreate(obj: Record<string, any>) {
      _cdir(this_.symbol, _mainpath(this_.symbol, [...obj.path]));
      let objmainpath = _mainpath(this_.symbol, [...obj.path, "_main.json"]);
      let objmain: Record<string, any> = {};
      let keychunks = chunkArray(
        Object.keys(obj.object),
        this_._options.max_keys_in_file
      );
      objmain.filenum = 0;
      objmain.filekeynum = 0;
      objmain.num = 0;
      objmain.keys = {};
      objmain.keynames = obj.path;
      if (keychunks.length === 0)
        _wf(
          this_.symbol,
          _mainpath(this_.symbol, [...obj.path, `0.json`]),
          this_.createObjectFromKeys(obj.path, {})
        );

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

        _wf(
          this_.symbol,
          _mainpath(this_.symbol, [...obj.path, `${i}.json`]),
          chunkfile
        );
      });

      _wf(this_.symbol, objmainpath, objmain);
      // this_.recreateMainFiles();
      moveToKeysFiles(this_.symbol, objmainpath);
    }

    function fromArr(a: any[]) {
      if (!Array.isArray(a)) return actualCreate(a);

      a.forEach((b) => {
        if (Array.isArray(b)) return fromArr(b);
        actualCreate(b);
      });
    }

    fromArr(objdir);

    getMainFiles(this.symbol);
    getFiles(this.symbol);

    return objdir;
  };

  create = (object: Record<string, any>): Promise<void> => {
    this.createSync(object);
    return this.recreateMainFiles();
  };

  getMainKeySync = (
    keypath: string | string[]
  ): Record<string, any> | undefined => {
    this.addAction(`getMainKeySync`);
    let objpath = this.getFileByKeys(keypath);

    if (!objpath.object_main) {
      let err = Error(`objpath.object_main is undefined (keypath: ${keypath})`);
      this.emitError(err);
      return undefined;
    }

    return this.getKeyFromObjectSync(
      objpath.object_main,
      keypath.slice(this._options.child_folders_keys)
    );
  };

  getKeySync = (keypath: string | string[], emitErr?: boolean): any => {
    this.addAction(`getKeySync`);
    let start = Date.now();
    let keypath_ = convertToArray(keypath);
    let objpath = this.getFileByKeys(keypath_);
    let end = Date.now();
    arrayModifiers.push(
      this.loadTimes,
      [["getKeySync", end - start, Date.now()]],
      50
    );

    if (keypath_.length > (objpath.object_main?.keynames?.length ?? 0)) {
      if (!objpath.keyfound) {
        let err = Error(`objpath.keyfound is false (keypath: ${keypath_})`);
        if (emitErr) this.emitError(err);
        return undefined;
      }

      if (!objpath.keyfound && objpath.keynamesmatched) {
        return getKeysForMainFile(this.symbol, objpath.path_main);
      }
      return this.getKeyFromObjectSync(objpath.object, keypath_);
    } else {
      if (!objpath.object_main) {
        let err = Error(
          `objpath.object_main is undefined (keypath: ${keypath_})`
        );
        if (emitErr) this.emitError(err);
        return undefined;
      }

      let r = {};
      objpath.dirpaths.forEach((a, i) => {
        let file = this._files[a]();
        let objects = this.getKeyFromObjectSync(
          file,
          objpath.leftkeys,
          emitErr
        );

        if (objects) r = concatJSON([r, objects]);
      });

      return r;
    }
  };

  addKeySync = <nosilenttype extends boolean>(
    keypath: string | string[],
    value: any,
    nosilent?: nosilenttype,
    newFile?: boolean
  ): nosilenttype extends true ? fileType | boolean : boolean => {
    this.addAction(`addKeySync`);
    let keypath_ = convertToArray(keypath);
    let objpath = this.getFileByKeys(keypath_);

    if (isNullUndefined(objpath.object_main?.num)) {
      this.createSync(this.addKeysToObjectSync({}, keypath_, value));
      getMainPaths(this.symbol);
      getMainFiles(this.symbol);
      return;
    }

    objpath = this.getFileByKeys(keypath_);

    let mainpath = objpath.path_main;
    let filepath = objpath.path;

    let file;
    file = recreate(objpath.object);

    if (
      newFile ||
      keypath_.length === (objpath.object_main?.keynames?.length ?? 0) + 1
    ) {
      if (
        objpath.object_main.filekeynum >= this._options.max_keys_in_file ||
        checkSize(
          this.symbol,
          recreate(file),
          addKeysToObject({}, keypath_, value)
        ) ||
        newFile
      ) {
        objpath.object_main.filenum++;
        objpath.object_main.filekeynum = 0;

        filepath = objpath.path_main.replace(
          _mainreg,
          `${objpath.object_main.filenum}.json`
        );
        i.splitterData[this.symbol].paths[filepath] = filepath
          .replace(_mainpath(this.symbol), "")
          .replace(slashreg, "");

        _wf(
          this.symbol,
          filepath,
          this.addKeysToObjectSync(
            this.createObjectFromKeys(objpath.object_main.keynames, {}),
            keypath_,
            value
          )
        );
        file = recreate(this._files[filepath]());
      }
    }

    if (this.getKeySync(keypath_) === undefined) {
      objpath.object_main.num++;
      objpath.object_main.filekeynum++;
    }

    this.addKeyToFileKeys(
      keypath_,
      objpath.keys[objpath.object_main.keynames.length],
      objpath.object_main.filenum
    );
    let newfile = this.addKeysToObjectSync(file, keypath_, value);
    i.splitterData[this.symbol].actualFiles[filepath] = newfile;
    this.addHasChanges(objpath.path_main, filepath);

    if (
      (this._options.silent?._all || this._options.silent?.addKey) &&
      !nosilent
    )
      return true;
    // @ts-ignore
    return newfile as fileType;
  };

  editKeySync = <nosilenttype extends boolean>(
    keypath: string | string[],
    value: any,
    nosilent?: nosilenttype
  ): nosilenttype extends true ? any | boolean : boolean => {
    this.addAction(`editKeySync`);
    let keypath_ = convertToArray(keypath);
    let objpath = this.getFileByKeys(keypath_);

    let mainpath = objpath.path_main;
    let filePath = objpath.path;

    let newfile;
    if (
      !objpath.object ||
      this.getKeyFromObjectSync(objpath.object_main, [
        "keys",
        keypath_[objpath.object_main.keynames.length],
      ]) === undefined
    ) {
      newfile = recreate(this.addKeySync(keypath_, value, nosilent));
    } else {
      let noAppendNewFile = false;
      if (
        checkSize(
          this.symbol,
          recreate(objpath.object),
          addKeysToObject({}, keypath_, value)
        )
      ) {
        this.deleteKeySync(keypath_);
        newfile = recreate(this.addKeySync(keypath_, value, true, true));

        noAppendNewFile = true;
      } else {
        newfile = this.addKeysToObjectSync(objpath.object, keypath_, value);
      }
      this.addHasChanges(objpath.path_main, filePath);
      if (!noAppendNewFile) {
        i.splitterData[this.symbol].actualFiles[filePath] = newfile;
      }
    }

    if (
      (this._options.silent?._all || this._options.silent?.editKey) &&
      !nosilent
    )
      return true;

    return newfile;
  };

  editKeyAddSync = <nosilenttype extends boolean>(
    keypath: string | string[],
    value: any,
    nosilent?: nosilenttype
  ): nosilenttype extends true ? fileType | boolean : boolean => {
    this.addAction(`editKeyAddSync`);
    let keypath_ = convertToArray(keypath);
    let objpath = this.getFileByKeys(keypath_);

    let mainpath = objpath.path_main;
    let filepath = objpath.path;

    let newfile;
    if (!objpath.object || this.getKeySync(keypath_) === undefined) {
      newfile = this.addKeySync(keypath_, value, true);
    } else {
      let noAppendNewFile = false;
      if (
        checkSize(
          this.symbol,
          recreate(objpath.object),
          this.addAppendKeysToObjectSync(objpath.object, keypath_, value, true)
        )
      ) {
        let valueNew = this.addAppendKeysToObjectSync(
          objpath.object,
          keypath_,
          value,
          true
        );
        this.deleteKeySync(keypath_);
        newfile = this.addKeySync(keypath_, valueNew, true);

        noAppendNewFile = true;
      } else {
        newfile = this.addAppendKeysToObjectSync(
          objpath.object,
          keypath_,
          value
        );
      }

      this.addHasChanges(objpath.path_main, filepath);
    }

    if (
      (this._options.silent?._all || this._options.silent?.editKeyAdd) &&
      !nosilent
    )
      return true;

    return newfile;
  };

  deleteKeySync = <nosilenttype extends boolean>(
    keypath: string | string[],
    nosilent?: nosilenttype,
    emiterr?: boolean
  ): nosilenttype extends true
    ? fileType | deleteKeySyncrettype
    : deleteKeySyncrettype => {
    this.addAction(`deleteKeySync`);
    let keypath_ = convertToArray(keypath);
    let objpath = this.getFileByKeys(keypath_);

    if (!objpath.object_main) {
      let err = Error(
        `objpath.object_main is undefined (keypath: ${keypath_})`
      );
      if (emiterr) this.emitError(err);
      return undefined;
    }

    let mainpath = objpath.path_main;

    let filepath = objpath.path_main.replace(
      _mainreg,
      `${objpath.filenum}.json`
    );
    let file = objpath.object;

    if (
      keypath_.length >
      (objpath.object_main?.keynames?.length ??
        this._options?.child_folders_keys)
    ) {
      let newfile = this.deleteKeyFromObjectSync(file, keypath_, emiterr);
      this.addHasChanges(objpath.path_main, filepath);

      if (keypath_.length === objpath.object_main.keynames.length + 1) {
        let mainfile = objpath.object_main;
        removeKeyFromKeysFile(this.symbol, keypath_);
        mainfile.num--;
        mainfile.filekeynum--;
        this.addHasChanges(objpath.path_main);
        i.splitterData[this.symbol].actualMainFiles[mainpath] = mainfile;
      }
      i.splitterData[this.symbol].actualFiles[filepath] = newfile;

      if (
        (this._options.silent?._all || this._options.silent?.deleteKey) &&
        !nosilent
      )
        return true;
      // @ts-ignore
      return newfile as fileType;
    } else {
      if (!objpath.dirpath) {
        let err = Error(
          `could not get maindirectory of specified keypath (keypath: ${keypath})`
        );
        this.emitError(err);
        return undefined;
      }

      try {
        delete i.splitterData[this.symbol].actualMainFiles[objpath.path_main];
      } catch (e) {}

      Object.keys(objpath.dirpaths).forEach((a) => {
        try {
          delete i.splitterData[this.symbol].actualFiles[a];
        } catch (e) {}
      });

      fs.rmSync(objpath.dirpath, { recursive: true });

      return true;
    }
  };

  addKeysToObjectSync = (
    object: Record<string, any>,
    keys: string | string[],
    value: any
  ): Record<string, any> => {
    let keys_ = convertToArray(keys);

    let parentObj = object;
    for (let i = 0; i < keys_.length - 1; i++) {
      let key = keys_[i];
      if (!(key in parentObj)) parentObj[key] = {};

      parentObj = parentObj[key];
    }

    parentObj[keys_[keys_.length - 1]] = value;
    return object;
  };

  addAppendKeysToObjectSync = (
    object: Record<string, any>,
    keys: string | string[],
    value: any,
    returnValue?: boolean
  ): Record<string, any> => {
    let keys_ = convertToArray(keys);

    let oldvalue = this.getKeyFromObjectSync(object, keys_);
    let newvalue = oldvalue ?? value;
    switch (extendedTypeof(oldvalue)) {
      case "json": {
        let jsonpaths = this.getKeyArraysFromObject(value);
        jsonpaths.forEach((a) => {
          this.addKeysToObjectSync(newvalue, a.path, a.value);
        });

        break;
      }

      case "array": {
        newvalue.push(...convertToArray(value));
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

  getKeyFromObjectSync = (
    object: Record<string, any>,
    keys: string | string[],
    emiterr?: boolean
  ): any => {
    let keys_ = convertToArray(keys);
    let value = object;
    for (let i = 0; i < keys_.length; i++) {
      if (value.hasOwnProperty(keys_[i])) {
        value = value[keys_[i]];
      } else {
        let err = Error(`key ${keys_[i]} not in value`);
        if (emiterr) this.emitError(err);
        return undefined;
      }
    }

    return value;
  };

  deleteKeyFromObjectSync = (
    object: Record<string, any>,
    keys: string | string[],
    emiterr?: boolean
  ): Record<string, any> => {
    let keys_ = convertToArray(keys);
    let parentObj = object;
    for (let i = 0; i < keys_.length - 1; i++) {
      if (!(keys_[i] in parentObj)) {
        let err = Error(`key ${keys_[i]} not in object`);
        if (emiterr) this.emitError(err);
        return undefined;
      } else {
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
      const obj = this.addAppendKeysToObjectSync(
        {},
        mainKeynames,
        this.getKeySync(mainKeynames)
      );

      const rmFilePaths = Object.keys(this._files).filter((b) =>
        new RegExp(
          `^${regexEscape(a.split("/").slice(0, -1).join("/"))}\/\\d+\.json`
        ).test(b)
      );

      [a, ...rmFilePaths].forEach((b) => fs.rmSync(b));

      this.createSync(obj);
    });

    try {
      this.save();
    } catch (e) {}
  };

  addKeyToFileKeys = (
    keypath: string[] | string,
    key: string,
    fileNum: number
  ) => {
    let keypath_ = convertToArray(keypath);
    let objpath = this.getFileByKeys(
      keypath_.slice(0, this._options.child_folders_keys)
    );

    return addKeyToFileKeys(
      this.symbol,
      objpath.path_main,
      addKeysToObject({}, ["keys", key], fileNum),
      false
    );
    // return addKeyToFileKeys(
    //   this.symbol,
    //   objpath.path_main,
    //   `${key},${fileNum}`
    // );
  };

  addHasChanges = (mainFilePath: string, hasChangesPath?: string) => {
    let mainFile = i.splitterData[this.symbol].actualMainFiles[mainFilePath];
    if (!mainFile.hasChanges) mainFile.hasChanges = [];
    if (!hasChangesPath) mainFile.hasKeyChanges = true;
    else if (!mainFile.hasChanges.includes(hasChangesPath))
      mainFile.hasChanges.push(hasChangesPath);
  };

  recreateMainFiles = async (): Promise<void> => {
    return new Promise(async (resolve, reject) => {
      await Promise.all(
        Object.keys(this._mainFiles).map((mainFilePath) => {
          return moveToKeysFiles(this.symbol, mainFilePath).then(() => {
            if (this._options.debug > 3)
              log(
                1,
                `Recreated main file ${mainFilePath} jsonsplitter: ${this.symbol}`
              );
          });
        })
      );

      await this.save();
      resolve();
    });
  };

  getMainKeysKeySync = (keypath: string | string[]) => {
    return getKeyFromKeysFiles(this.symbol, keypath);
  };
}
