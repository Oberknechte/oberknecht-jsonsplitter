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

module.exports = class jsonsplitter {
    #symbol = Symbol();
    get symbol() { return this.#symbol; };

    get _maindirs() { return i.splitterData[this.symbol]?.mainpaths ?? getmainpaths(this.symbol); };
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

        if (options.debug >= 0) {
            _log(1, `[JSONSPLITTER] Directory: ${options.startpath}`);
        };

        i.splitterData[this.symbol] = {};
        this._options = i.splitterData[this.symbol]._options = options;

        getmainfiles(this.symbol);
        getfiles(this.symbol);

        require("../handlers/filechange")(this.symbol, (options.filechange_interval ?? 15000));
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

    getDirPathByKeys = (keypath) => {
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
        if (!Array.isArray(keys)) keys = [keys];
        let o = {};
        keys.forEach((a, i) => {
            if (i == keys.length - 1) o[a] = value; else o[a] = {};
        });

        return o;
    };

    addKeysToObject = (object, keys, value) => {
        let parentObj = object;
        for (let i = 0; i < (keys.length - 1); i++) {
            if (!parentObj) parentObj = {};
            if (!parentObj?.hasOwnProperty(keys[i])) {
                parentObj[keys[i]] = {};
            }
            parentObj = parentObj[keys[i]];
        };
        parentObj[keys[keys.length - 1]] = value;
        return object;
    };

    getKeysFromObject = (object, keys) => {
        let o = object;
        function getFromObject(i) {
            if (!o) return new Error(`key ${keys[i]} does not exist on object (${i})`);
            o = o[keys[i]];

            if (!keys[i + 1]) return;
            getFromObject(i + 1);
        };
        getFromObject(0)
        return o;
    };

    getKeyFromObject = (object, keys) => {
        let value = object;
        for (let i = 0; i < keys.length; i++) {
            if (value.hasOwnProperty(keys[i])) {
                value = value[keys[i]];
            } else {
                return undefined;
            }
        }
        return value;
    };

    deleteKeyFromObject = (object, keys) => {
        let parentObj = object;
        for (let i = 0; i < keys.length - 1; i++) {
            parentObj = parentObj[keys[i]];
        }
        delete parentObj[keys[keys.length - 1]];
        return object;
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

    getFileByKeys = (keypath) => {
        let p = "";
        let p_main = "";
        let o = {};
        let o_main = {};
        let keys = keypath;
        keypath.forEach((a, i) => {
            let dirpathkeys = this.getDirPathByKeys(keypath.slice(0, i + 1));
            let filteredkeypath = Object.keys(this._paths).filter(b => new RegExp(`^${dirpathkeys[1]}\/_main\.json`).test(b));
            if (filteredkeypath.length === 0) return keys.splice(0, 1);;
            p_main = filteredkeypath[0];
            o_main = this._files[p_main];
            let filenum = o_main.filenum;
            if (o_main.keys?.[keypath[i + 1]]) filenum = o_main.keys[keypath[i + 1]];
            p = p_main.replace(_mainreg, `${filenum}.json`);
            o = this._files[p];
        });

        return {
            path: p,
            path_main: p_main,
            object_main: o_main,
            object: o,
            keys: keys
        };
    };

    getDirMain = (keypath) => {
        return _mainpath(this.symbol, [...this.convertToArray(keypath).slice(0, this._options.min_keys_to_create_file - 1), "_main.json"]);
    };

    getMainPath = (keypath) => {
        return _mainpath(this.symbol, [...this.convertToArray(keypath).slice(0, keypath.length - 1), "_main.json"]);
    };

    getMainKey = (keypath) => {
        let mainpath = this.getMainPath(keypath);
        if (!mainpath) return undefined;
        let mainfile = i.splitterData[this.symbol].mainfiles[mainpath];
        if (!mainfile) return undefined;

        return mainfile[keypath[keypath.length - 1]];
    };

    getKey = (keypath) => {
        let objpath = this.getFileByKeys(keypath);
        if (!objpath) {
            if (this._options.debug >= 5) console.error(new Error(`dir (${objpath}) not in mainfiles`));
            return undefined;
        };

        let filenum = this.getKeyFromObject(objpath.object_main, ["keys", ...objpath.keys.slice(1, 2)]);
        if (!(filenum ?? undefined) || isNaN(filenum)) {
            if (this._options.debug >= 5) console.error(new Error(`key(s) (${objpath.keys.slice(1, 2)}) not found in mainfile keys`));
            return undefined;
        };

        let file = i.splitterData[this.symbol].files[objpath.path_main.replace(_mainreg, `${filenum}.json`)];

        return this.getKeyFromObject(file, this.convertToArray(keypath));
    };

    addKey = (keypath, value) => {
        let objpath = this.getFileByKeys(keypath);
        if (!objpath) {
            if (this._options.debug >= 5) console.error(new Error(`dir (${objpath}) not in mainfiles`));
            return undefined;
        };
        let mainpath = objpath.path_main;
        let mainfile = i.splitterData[this.symbol].mainfiles[mainpath];

        let filepath = objpath.path_main.replace(_mainreg, `${mainfile.filenum}.json`);
        let file = objpath.object;

        if (mainfile.filekeynum >= this._options.max_keys_in_file) {
            mainfile.filenum++;
            mainfile.filekeynum = 0;

            filepath = objpath.path_main.replace(_mainreg, `${mainfile.filenum}.json`);
            file = this.createObjectFromKeys(mainfile.keynames, {});
            _wf(this.symbol, filepath, file);

            i.splitterData[this.symbol].paths[filepath] = filepath.replace(_mainpath(this.symbol), "").replace(slashreg, "");
            i.splitterData[this.symbol].files[filepath] = file;
        };

        mainfile.num++;

        mainfile = this.addKeysToObject(mainfile, ["keys", ...objpath.keys.slice(1, 2)], mainfile.filenum);
        if (!mainfile.hasChanges) mainfile.hasChanges = [];
        if (!mainfile.hasChanges.includes(filepath)) mainfile.hasChanges.push(filepath);
        file = i.splitterData[this.symbol].files[filepath] = this.addKeysToObject(file, keypath, value);

        return file;
    };

    editKey = (keypath, value) => {
        let objpath = this.getFileByKeys(keypath);
        if (!objpath) {
            if (this._options.debug >= 5) console.error(new Error(`dir (${objpath}) not in mainfiles`));
            return undefined;
        };
        let mainpath = objpath.path_main;
        let mainfile = i.splitterData[this.symbol].mainfiles[mainpath];

        let filenum = this.getKeyFromObject(mainfile, ["keys", keypath.slice(1, 2)]);
        if (!filenum) {
            if (this._options.debug >= 5) console.error(new Error(`key (${keypath.slice(1, 2)}) not found in mainfile`));
            return undefined;
        };

        let filepath = objpath.path;
        let file = i.splitterData[this.symbol].files[filepath];
        if (!mainfile.hasChanges) mainfile.hasChanges = [];
        if (!mainfile.hasChanges.includes(filepath)) mainfile.hasChanges.push(filepath);

        file = this.addKeysToObject(file, keypath, value);

        // let newkey = this.addKeysToObject(this.getKey(this.convertToArray(keypath.slice(0, keypath.length-1))), this.convertToArray(keypath.slice(keypath.length-1)), value);
        // file = i.splitterData[this.symbol].files[filepath] = this.addKeysToObject(file, keypath.slice(0, keypath.length-1), newkey);

        return file;
    };

    deleteKey = (keypath) => {
        let objpath = this.getFileByKeys(keypath);
        if (!objpath) {
            if (this._options.debug >= 5) console.error(new Error(`dir (${objpath}) not in mainfiles`));
            return undefined;
        };
        let mainpath = objpath.path_main;
        let mainfile = i.splitterData[this.symbol].mainfiles[mainpath];

        mainfile.num--;
        mainfile.filekeynum--;

        let filenum = this.getKeyFromObject(mainfile, ["keys", ...objpath.keys.slice(1)]);
        let filepath = objpath.path_main.replace(_mainreg, `${filenum}.json`);
        let file = objpath.object;

        mainfile = this.deleteKeyFromObject(mainfile, ["keys", ...objpath.keys.slice(1)]);
        if (!mainfile.hasChanges) mainfile.hasChanges = [];
        if (!mainfile.hasChanges.includes(filepath)) mainfile.hasChanges.push(filepath);
        file = i.splitterData[this.symbol].files[filepath] = this.deleteKeyFromObject(file, [...mainfile.keynames, ...objpath.keys.slice(1)]);

        return file;
    };

    convertToArray = (keys) => {
        if (!Array.isArray(keys)) return [keys];
        return keys;
    };
};