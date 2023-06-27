import { oberknechtEmitter } from "oberknecht-emitters";
import { jsonsplitteroptions } from "../types/jsonsplitter.options";
import { onCallback, onErrorCallback } from "../types/callbacks";
import { deleteKeySyncrettype, fileType, getFileByKeysReturn } from "../types/jsonsplitter";
export declare class jsonsplitter {
    #private;
    get symbol(): string;
    oberknechtEmitter: oberknechtEmitter;
    get _mainpaths(): any;
    get _mainfiles(): any;
    get _paths(): any;
    get _files(): any;
    get _actions(): any;
    _options: jsonsplitteroptions;
    constructor(options: jsonsplitteroptions);
    addAction: (action: string) => void;
    on: (type: string, callback: typeof onCallback) => void;
    onError: (callback: typeof onErrorCallback) => void;
    emit: (eventname: string | string[], args?: any) => void;
    emitError: (e: Error) => void;
    create: (object: Record<string, any>) => Promise<unknown>;
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
    getMainKeySync: (keypath: string | string[]) => Record<string, any> | undefined;
    getKeySync: (keypath: string | string[], emitErr?: boolean) => any;
    addKeySync: <nosilenttype extends boolean>(keypath: string | string[], value: any, nosilent?: nosilenttype) => nosilenttype extends true ? boolean | fileType : boolean;
    editKeySync: <nosilenttype extends boolean>(keypath: string | string[], value: any, nosilent?: nosilenttype) => nosilenttype extends true ? any : boolean;
    editKeyAddSync: <nosilenttype extends boolean>(keypath: string | string[], value: any, nosilent?: nosilenttype) => nosilenttype extends true ? boolean | fileType : boolean;
    deleteKeySync: <nosilenttype extends boolean>(keypath: string | string[], nosilent?: nosilenttype, emiterr?: boolean) => nosilenttype extends true ? fileType | deleteKeySyncrettype : deleteKeySyncrettype;
    addKeysToObjectSync: (object: Record<string, any>, keys: string | string[], value: any) => Record<string, any>;
    addAppendKeysToObjectSync: (object: Record<string, any>, keys: string | string[], value: any) => Record<string, any>;
    getKeyFromObjectSync: (object: Record<string, any>, keys: string | string[], emiterr?: boolean) => any;
    deleteKeyFromObjectSync: (object: Record<string, any>, keys: string | string[], emiterr?: boolean) => Record<string, any>;
    addKeysToObject: (object: Record<string, any>, keys: string | string[], value: any) => Promise<Record<string, any>>;
    addAppendKeysToObject: (object: Record<string, any>, keys: string | string[], value: any) => Promise<Record<string, any>>;
    getKeyFromObject: (object: Record<string, any>, keys: string | string[], noreject?: boolean) => Promise<any>;
    deleteKeyFromObject: (object: Record<string, any>, keys: string | string[], noreject?: boolean) => Promise<Record<string, any>>;
    getMainPath: (keypath: string | string[]) => string;
    getMainKey: (keypath: string | string[], noreject?: boolean) => Promise<any>;
    getKey: (keypath: string | string, noreject?: boolean) => Promise<any>;
    addKey: (keypath: string | string[], value: any, noreject?: boolean) => Promise<void | fileType>;
    editKey: (keypath: string | string[], value: any, noreject?: boolean) => Promise<void | fileType>;
    /** Adds value to the key given (new value = <old value> + <value>) */
    editKeyAdd: (keypath: string | string[], value: any, noreject?: boolean) => Promise<void | fileType>;
    deleteKey: (keypath: string | string[], noreject?: boolean) => Promise<void | fileType>;
}
