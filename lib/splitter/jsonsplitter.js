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
const slashreg = /^\/|\/$/g;

module.exports = class jsonsplitter {
    #symbol = Symbol();
    get symbol() {
        return this.#symbol;
    };

    get _maindirs() { return i.splitterData[this.symbol]?.mainpaths ?? getmainpaths(this.symbol); };
    get _mainfiles() { return i.splitterData[this.symbol]?.mainfiles ?? getmainfiles(this.symbol); };
    get _paths() { return i.splitterData[this.symbol]?.paths ?? getpaths(this.symbol); };
    get _files() { return i.splitterData[this.symbol]?.files ?? getfiles(this.symbol); };

    /** @param {jsonsplitteroptions} options */
    constructor(options) {
        if (!(options ?? undefined)) options = {};
        options.child_folders_keys = (options?.child_folders_keys ?? 1);
        options.max_keys_in_file = (options?.max_keys_in_file ?? 3000);
        options.startpath = (options?.startpath ?? _mainpath("./data"));

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
            dp.split("/").slice((dp.split("/").length - rp.split("/").length + 1)).join("/")
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
        for (let i = 0; i < keys.length - 1; i++) {
            if (!parentObj.hasOwnProperty(keys[i])) {
                parentObj[keys[i]] = {};
            }
            parentObj = parentObj[keys[i]];
        }
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
            // console.log(o_main.keys?.[keypath[i+1]], this.getKeyArrayFromObject(Object.keys(o_main.keys ?? [])).includes(keypath.slice(i)))
            if (o_main.keys?.[keypath[i + 1]]) filenum = o_main.keys[keypath[i + 1]];
            p = p_main.replace(/_main\.json$/g, `${filenum}.json`);
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

    getKey = (keypath) => {
        let objpath = this.getFileByKeys(keypath);
        if (!objpath) return new Error(`dir (${objpath}) not in mainfiles`);

        let filenum = this.getKeyFromObject(objpath.object_main, ["keys", objpath.keys.slice(1)]);
        if (!(filenum ?? undefined) && isNaN(filenum)) return new Error(`key (${objpath.keys[objpath.keys.length - 1]}) not found in mainfile keys`);

        let file = i.splitterData[this.symbol].files[objpath.path_main.replace(/_main\.json$/g, `${filenum}.json`)];

        return this.getKeyFromObject(file, objpath.keys);
    };

    addKey = (keypath, value) => {
        let objpath = this.getFileByKeys(keypath);
        if (!objpath) return new Error(`dir (${objpath}) not in mainfiles`);
        let mainpath = objpath.path_main;
        let mainfile = i.splitterData[this.symbol].mainfiles[mainpath];

        let filepath = objpath.path_main.replace(/_main\.json$/g, `${mainfile.filenum}.json`);
        let file = objpath.object;

        if (mainfile.filekeynum >= this._options.max_keys_in_file) {
            mainfile.filenum++;
            mainfile.filekeynum = 0;

            filepath = objpath.path_main.replace(/_main\.json$/g, `${mainfile.filenum}.json`);
            file = this.createObjectFromKeys(mainfile.keynames, {});
            _wf(this.symbol, filepath, file);

            i.splitterData[this.symbol].paths[filepath] = filepath.replace(_mainpath(this.symbol), "").replace(/^\/|\/$/g, "");
            i.splitterData[this.symbol].files[filepath] = file;
        };

        mainfile = this.addKeysToObject(mainfile, ["keys", ...objpath.keys.slice(1)], mainfile.filenum);
        if (!mainfile.hasChanges) mainfile.hasChanges = [];
        mainfile.hasChanges.push(filepath);
        file = i.splitterData[this.symbol].files[filepath] = this.addKeysToObject(file, [...mainfile.keynames, ...objpath.keys.slice(1)], value);

        return true;
    };

    editKey = this.addKey;

    deleteKey = (keypath) => {
        let objpath = this.getFileByKeys(keypath);
        if (!objpath) return new Error(`dir (${objpath}) not in mainfiles`);
        let mainpath = objpath.path_main;
        let mainfile = i.splitterData[this.symbol].mainfiles[mainpath];

        let filenum = this.getKeyFromObject(mainfile, ["keys", ...objpath.keys.slice(1)]);
        let filepath = objpath.path_main.replace(/_main\.json$/g, `${filenum}.json`);
        let file = objpath.object;

        mainfile = this.deleteKeyFromObject(mainfile, ["keys", ...objpath.keys.slice(1)]);
        if (!mainfile.hasChanges) mainfile.hasChanges = [];
        mainfile.hasChanges.push(filepath);
        file = i.splitterData[this.symbol].files[filepath] = this.deleteKeyFromObject(file, [...mainfile.keynames, ...objpath.keys.slice(1)]);

        return true;
    };

    getDirMain = (keypath) => {
        return _mainpath(this.symbol, [...keypath.slice(0, this._options.min_keys_to_create_file - 1), "_main.json"]);
    };
};