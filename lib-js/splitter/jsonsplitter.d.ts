import { oberknechtEmitter } from "oberknecht-emitters";
import { jsonsplitteroptions } from "../types/jsonsplitter.options";
import { onCallback, onErrorCallback } from "../types/callbacks";
import { deleteKeySyncrettype, fileType, getFileByKeysReturn } from "../types/jsonsplitter";
export declare class jsonsplitter {
    #private;
    get symbol(): string;
    oberknechtEmitter: oberknechtEmitter;
    get _mainPaths(): any;
    get _mainFiles(): any;
    get _keysPaths(): any;
    get _keysFiles(): any;
    get _paths(): any;
    get _files(): any;
    get _actions(): any;
    _options: jsonsplitteroptions;
    loadTimes: any[];
    constructor(options_: jsonsplitteroptions);
    addAction: (action: string, args?: any[]) => void;
    on: (type: string, callback: typeof onCallback) => void;
    onError: (callback: typeof onErrorCallback) => void;
    emit: (eventname: string | string[], args?: any) => void;
    emitError: (e: Error) => void;
    destroy: () => Promise<void>;
    save: () => Promise<void>;
    clearCache: (excludeMainFiles?: boolean) => void;
    clearCacheSmart: (excludeMainFiles?: boolean) => void;
    getDirPathsByObject: (o: Record<string, any>, n1?: number) => string[][];
    getDirPathsByKeys: (keypath: string | string[]) => string[];
    createObjectFromKeys: (keys: string | string[], value: any) => Record<string, any>;
    getKeyArrayFromObject: (object: Record<string, any>) => string[];
    getKeyArraysFromObject: (object: Record<string, any>) => {
        path: string[];
        value: any;
    }[];
    getFileByKeys: (keypath: string | string[]) => getFileByKeysReturn;
    createSync: (object: Record<string, any>) => string[][];
    create: (object: Record<string, any>) => Promise<void>;
    createBackup: () => void;
    getMainKeySync: (keypath: string | string[]) => Record<string, any> | undefined;
    getKeySync: (keypath: string | string[], emitErr?: boolean, returnRecreate?: boolean) => any;
    addKeySync: <nosilenttype extends boolean>(keypath: string | string[], value: any, nosilent?: nosilenttype, newFile?: boolean) => nosilenttype extends true ? fileType | boolean : boolean;
    editKeySync: <nosilenttype extends boolean>(keypath: string | string[], value: any, nosilent?: nosilenttype) => nosilenttype extends true ? any | boolean : boolean;
    editKeyAddSync: <nosilenttype extends boolean>(keypath: string | string[], value: any, nosilent?: nosilenttype) => nosilenttype extends true ? fileType | boolean : boolean;
    deleteKeySync: <nosilenttype extends boolean>(keypath: string | string[], nosilent?: nosilenttype, emiterr?: boolean) => nosilenttype extends true ? fileType | deleteKeySyncrettype : deleteKeySyncrettype;
    addKeysToObjectSync: (object: Record<string, any>, keys: string | string[], value: any) => Record<string, any>;
    addAppendKeysToObjectSync: (object: Record<string, any>, keys: string | string[], value: any, returnValue?: boolean) => Record<string, any>;
    getKeyFromObjectSync: (object: Record<string, any>, keys: string | string[], emiterr?: boolean) => any;
    deleteKeyFromObjectSync: (object: Record<string, any>, keys: string | string[], emiterr?: boolean) => Record<string, any>;
    recreateAllSync: () => void;
    addKeyToFileKeys: (keypath: string[] | string, key: string, fileNum: number) => any;
    addHasChanges: (mainFilePath: string, hasChangesPath?: string) => void;
    recreateMainFiles: () => Promise<void>;
    getMainKeysKeySync: (keypath: string | string[]) => any;
}
