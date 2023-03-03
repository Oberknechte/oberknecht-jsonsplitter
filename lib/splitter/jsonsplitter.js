const jsonsplitteroptions = require("../arguments/jsonsplitter.options");
const _mainpath = require("../functions/_mainpath");
const _cdir = require("../functions/_cdir");
const _wf = require("../functions/_wf");
const _chunkArray = require("../functions/_chunkArray");
const i = require("..");
const getmainpaths = require("../functions/getmainpaths");
const getmainfiles = require("../functions/getmainfiles");
const getpaths = require("../functions/getpaths");
const getfiles = require("../functions/getfiles");
const _log = require("../functions/_log");
const slashreg = /^\/|\/$/g;
const _mainreg = /_main\.json$/g;
const { oberknechtEmitter } = require("oberknecht-emitters");

const onErrorcallback = /**@param {Error} error */ (error) => { };

class jsonsplitter {
    #symbol = Symbol();
    get symbol() { return this.#symbol; };

    oberknechtEmitter = new oberknechtEmitter();

    get _mainpaths() { return i.splitterData[this.symbol]?.mainpaths ?? getmainpaths(this.symbol); };
    get _mainfiles() { return i.splitterData[this.symbol]?.mainfiles ?? getmainfiles(this.symbol); };
    get _paths() { return i.splitterData[this.symbol]?.paths ?? getpaths(this.symbol); };
    get _files() { return i.splitterData[this.symbol]?.files ?? getfiles(this.symbol); };

    /** @param {jsonsplitteroptions} options */
    constructor(options) {
        if (!(options ?? undefined)) options = {};
        options.child_folders_keys = (options?.child_folders_keys ?? 1);
        options.max_keys_in_file = (options?.max_keys_in_file ?? 3000);
        options.startpath = (_mainpath(options?.startpath ?? "./data"));
        options.debug = (options.debug ?? 2);

        if (options.debug >= 0) _log(1, `[JSONSPLITTER] Directory: ${options.startpath}`);

        i.splitterData[this.symbol] = {
            actualFiles: {},
            actualMainFiles: {}
        };
        this._options = i.splitterData[this.symbol]._options = options;

        i.oberknechtEmitter[this.symbol] = this.oberknechtEmitter;

        // process.on("unhandledRejection", e => this.oberknechtEmitter.emitError("unhandledRejection", e));
        // process.on("uncaughtException", e => this.oberknechtEmitter.emitError("uncaughtException", e));

        getmainfiles(this.symbol);
        getfiles(this.symbol);

        require("../handlers/filechange")(this.symbol, (options.filechange_interval ?? 15000));
    };

    /** @param {onErrorcallback} callback */
    onError = (callback) => {
        return this.oberknechtEmitter.on("error", callback);
    };

    create = (object) => {
        let objdir = this.getDirPathsByObject(object);
        objdir.forEach(obj => {
            _cdir(this.symbol, _mainpath(this.symbol, [...obj.path]));
            let objmainpath = _mainpath(this.symbol, [...obj.path, "_main.json"]);
            let objmain = {};
            let keychunks = _chunkArray(Object.keys(obj.object), this._options.max_keys_in_file);
            if (!objmain.filenum) objmain.filenum = keychunks.length - 1;
            if (!objmain.num) objmain.num = 0;
            if (!objmain.keys) objmain.keys = {};
            keychunks.forEach((keychunk, i) => {
                let keychunk_ = {};
                objmain.num += keychunk.length;
                objmain.filekeynum = keychunk.length;
                objmain.keynames = obj.path;
                keychunk.forEach(a => {
                    keychunk_[a] = obj.object[a];
                    objmain.keys[a] = i;
                });
                let chunkfile = this.createObjectFromKeys(obj.path, keychunk_);
                _wf(this.symbol, _mainpath(this.symbol, [...obj.path, `${i}.json`]), chunkfile);
            });

            _wf(this.symbol, objmainpath, objmain);
        });

        return objdir;
    };

    getDirPathsByObject = (o, n1) => {
        function getDirPathByObject(o2, n, ml, p, ob) {
            if (((n >= ml) || Object.keys(o2).filter(a => typeof o2[a] !== "object").length > 0)) {
                ob._options.child_folders_keys = i.splitterData[ob.symbol]._options.child_folders_keys = n;
                return {
                    path: p,
                    object: o2
                };
            };

            const nn = n + 1;
            return Object.keys(o2).map(k3 => {
                const p2 = [...p, k3];
                return getDirPathByObject(o2[k3], nn, ml, p2, ob);
            });
        };
        return getDirPathByObject(o, 0, (n1 ?? this._options.child_folders_keys), [], this);
    };

    getDirPathsByKeys = (keypath) => {
        let dp = _mainpath(this.symbol, keypath.join("/"));
        let rp = dp.split(_mainpath(this.symbol))[1].replace(slashreg, "");
        return [
            dp,
            dp.split("/").slice(0, (dp.split("/").length - rp.split("/").length + 1)).join("/"),
            dp.split("/").slice((dp.split("/").length - rp.split("/").length + 1)).join("/"),
            dp.split("/").slice(0, (dp.split("/").length - rp.split("/").length + 1)).join("/") + "/_main.json",
        ];
    };

    createObjectFromKeys = (keys, value) => {
        let o = {};
        keys = this.convertToArray(keys);
        keys.forEach((a, i) => {
            if (i == keys.length - 1) o[a] = value; else o[a] = {};
        });
        return o;
    };

    addKeysToObject = (object, keys, value) => {
        return new Promise((resolve, reject) => {
            keys = this.convertToArray(keys);

            let parentObj = object;
            for (let i = 0; i < keys.length - 1; i++) {
                let key = keys[i];
                if (!(key in parentObj)) {
                    parentObj[key] = {};
                }
                parentObj = {
                    ...parentObj,
                    [key]: parentObj[key]
                };
            };

            parentObj[keys[keys.length - 1]] = value;
            return resolve(object);
        });
    };

    getKeysFromObject = (object, keys, addifnotexisting) => {
        return new Promise((resolve, reject) => {
            let o = object;
            function getFromObject(i) {
                if (!(keys[i] in object)) {
                    if (addifnotexisting) {
                        object[keys[i]] = {};
                    } else {
                        return reject({ error: Error(`key ${keys[i]} does not exist on object (${i})`) });
                    };
                }
                o = o?.[keys[i]];

                if (!keys[i + 1]) return;
                getFromObject(i + 1);
            };
            getFromObject(0);
            return resolve(o);
        });
    };

    getKeyFromObject = (object, keys) => {
        return new Promise((resolve, reject) => {
            let value = object;
            for (let i = 0; i < keys.length; i++) {
                if (value.hasOwnProperty(keys[i])) {
                    value = value[keys[i]];
                } else {
                    return reject();
                }
            }
            return resolve(value);
        });
    };

    deleteKeyFromObject = (object, keys) => {
        return new Promise((resolve, reject) => {
            let parentObj = object;
            for (let i = 0; i < keys.length - 1; i++) {
                if (!(keys[i] in parentObj)) {
                    return reject({ error: Error(`key ${keys[i]} not in object`) });
                } else {
                    parentObj = parentObj[keys[i]];
                };
            };
            let delkey = keys[keys.length - 1];
            delete parentObj[delkey];
            return resolve(object);
        });
    };

    getKeyArrayFromObject = (object) => {
        let r = [];
        function go(o2) {
            if (Object.keys(o2).length > 0) return;
            r.push(Object.keys(o2)[0]);
            go(o2[Object.keys(o2)[0]]);
        };
        go(object);
        return r;
    };

    convertToArray = (keys) => {
        if (!Array.isArray(keys)) return [keys];
        return keys;
    };

    getFileByKeys = (keypath) => {
        let p = undefined;
        let p_main = undefined;
        let o = {};
        let o_main = {};
        let keys = keypath;
        keypath.forEach((a, i) => {
            let dirpathkeys = this.getDirPathsByKeys(keypath.slice(0, i + 1));
            let filteredkeypath = Object.keys(this._mainpaths).filter(b => new RegExp(`^${dirpathkeys[1]}\/_main\.json`).test(b));
            if (!filteredkeypath || filteredkeypath.length === 0) return keys.splice(0, 1);;
            p_main = filteredkeypath[0];
            o_main = this._mainfiles[p_main]?.();
            let filenum = o_main.filenum;
            if (o_main.keys?.[keypath[i + 1]]) filenum = o_main.keys[keypath[i + 1]];
            p = p_main.replace(_mainreg, `${filenum}.json`);
            o = this._files[p]?.();
        });
        return {
            path: p,
            path_main: p_main,
            object_main: o_main,
            object: o,
            keys: keys
        };
    };

    getMainPath = (keypath) => {
        let keypath_ = this.convertToArray(keypath);
        return _mainpath(this.symbol, [...keypath_.slice(0, (keypath_.length > this._options.max_keys_in_file ? this._options.max_keys_in_file : keypath_.length - 1)), "_main.json"]);
    };

    getMainKey = (keypath) => {
        return new Promise((resolve, reject) => {
            let objpath = this.getFileByKeys(keypath);
            if (!objpath?.object_main) return reject({ error: Error("objpath.object_main is undefined") });
            if (!(keypath[keypath.length - 1] in objpath.object_main)) return reject({ error: Error(`key ${keypath[keypath.length - 1]} not in main object`) });
            return resolve(objpath.object_main[keypath[keypath.length - 1]]);
        });
    };

    getKey = (keypath) => {
        return new Promise(async (resolve, reject) => {
            let objpath = this.getFileByKeys(keypath);
            if (!objpath.object_main) return reject({ error: Error("objpath.object_main is undefined") });
            let filenum = await this.getKeyFromObject(objpath.object_main, ["keys", objpath.keys[1]]);
            console.log(filenum)
            if (!(filenum ?? undefined) || isNaN(filenum)) return reject({ error: Error(`key(s) (${objpath.keys[1]}) not found in mainfile keys`) });
            let filepath = objpath.path_main.replace(_mainreg, `${filenum}.json`);
            let file = this._files[filepath]?.();
            if (!file) return reject({ error: Error("file is undefined") });

            let key = await this.getKeyFromObject(file, keypath);
            return resolve(key);
        });
    };

    addKey = (keypath, value) => {
        return new Promise(async (resolve, reject) => {
            let objpath = this.getFileByKeys(keypath);
            if (!objpath.object_main) return reject({ error: Error("objpath.object_main is undefined") });

            let mainfile = objpath.object_main;
            let mainpath = objpath.path_main;

            let filepath = objpath.path;
            let file = objpath.object;

            if (mainfile.filekeynum >= this._options.max_keys_in_file) {
                if (!mainfile.hasChanges) mainfile.hasChanges = [];
                if (!mainfile.hasChanges.includes(filepath)) mainfile.hasChanges.push(filepath);

                mainfile.filenum++;
                mainfile.filekeynum = 0;

                filepath = objpath.path_main.replace(_mainreg, `${mainfile.filenum}.json`);
                file = this.createObjectFromKeys(mainfile.keynames, {});
                _wf(this.symbol, filepath, file);

                mainfile.hasChanges.push(filepath);

                i.splitterData[this.symbol].paths[filepath] = filepath.replace(_mainpath(this.symbol), "").replace(slashreg, "");
            };

            mainfile.num++;
            mainfile.filekeynum++;

            mainfile = await this.addKeysToObject(mainfile, ["keys", objpath.keys[1]], mainfile.filenum);

            file = i.splitterData[this.symbol].actualFiles[filepath] = await this.addKeysToObject(file, keypath, value);

            if (!mainfile.hasChanges) mainfile.hasChanges = [];
            if (!mainfile.hasChanges.includes(filepath)) mainfile.hasChanges.push(filepath);
            i.splitterData[this.symbol].actualMainFiles[mainpath] = mainfile;

            return resolve(file);
        });
    };

    editKey = (keypath, value) => {
        return new Promise(async (resolve, reject) => {
            let keypath_ = this.convertToArray(keypath);
            let objpath = this.getFileByKeys(this.convertToArray(keypath));
            if (!objpath.object_main) return reject({ error: Error("objpath.object_main is undefined") });

            let mainpath = objpath.path_main;
            let mainfile = objpath.object_main;

            let filenum = await this.getKeyFromObject(mainfile, ["keys", objpath.keys[1]]);
            if (!filenum) return reject({ error: Error("filenum is undefined") });

            let filepath = objpath.path_main.replace(_mainreg, `${filenum}.json`);
            let file = this._files[filepath]?.();

            let addobj = await this.getKeysFromObject(file, this.convertToArray(keypath_.slice(0, keypath_.length - 1)), true).catch(e => { return reject(Error("", { "cause": e })) });
            let added = await this.addKeysToObject(addobj, this.convertToArray(keypath_[keypath_.length - 1]), value).catch(reject);
            file = i.splitterData[this.symbol].actualFiles[filepath] = await this.addKeysToObject(file, this.convertToArray(keypath_.slice(0, keypath_.length - 2)), added);

            if (!mainfile.hasChanges) mainfile.hasChanges = [];
            if (!mainfile.hasChanges.includes(filepath)) mainfile.hasChanges.push(filepath);
            i.splitterData[this.symbol].actualMainFiles[mainpath] = mainfile;

            return resolve(file);
        });
    };

    deleteKey = (keypath) => {
        return new Promise(async (resolve, reject) => {
            let objpath = this.getFileByKeys(keypath);
            if (!objpath.object_main) return reject({ error: Error("objpath.object_main is undefined") });

            let mainpath = objpath.path_main;
            let mainfile = objpath.object_main;

            mainfile.num--;
            mainfile.filekeynum--;

            let filenum = await this.getKeyFromObject(mainfile, ["keys", objpath.keys[1]]);
            let filepath = objpath.path_main.replace(_mainreg, `${filenum}.json`);
            let file = objpath.object;

            mainfile = await this.deleteKeyFromObject(mainfile, ["keys", objpath.keys[1]]);

            file = i.splitterData[this.symbol].actualFiles[filepath] = await this.deleteKeyFromObject(file, keypath);

            if (!mainfile.hasChanges) mainfile.hasChanges = [];
            if (!mainfile.hasChanges.includes(filepath)) mainfile.hasChanges.push(filepath);
            i.splitterData[this.symbol].actualMainFiles[mainpath] = mainfile;

            return resolve(file);
        });
    };
};

module.exports = jsonsplitter;