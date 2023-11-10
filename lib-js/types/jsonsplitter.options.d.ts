export declare const jsonsplitterOptionsDebugs: readonly ["_cdir", "_mainpath", "_rf", "_wf", "addKeyToFileKeys", "checkSize", "clearCache", "clearCacheSmart", "getFiles", "getKeyFromKeysFiles", "getKeysFiles", "getKeysForMainFile", "getKeysPaths", "getMainFiles", "getMainPaths", "moveToKeysFiles", "removeKeyFromKeysFile", "saveKeysFile"];
export type jsonsplitterOptionsDebugsType = typeof jsonsplitterOptionsDebugs[number];
export type jsonsplitteroptions = {
    child_folders_keys?: number | 1;
    debug?: number | 2;
    debugs?: jsonsplitterOptionsDebugsType[];
    debugsWithout?: jsonsplitterOptionsDebugsType[];
    debugsWithoutArgs?: boolean;
    debugsLogDir?: string;
    debugsLogWithout: jsonsplitterOptionsDebugsType[];
    debugsLogWithoutArgs?: boolean;
    debugsLogWithoutStack?: boolean;
    max_keys_in_file?: number | 3000;
    startpath?: string | "./data";
    filechange_interval?: number | 15000;
    cacheSettings?: {
        noAutoClearCacheSmart?: boolean | false;
        maxFileCacheAge?: number | 600000;
        maxMainFileCacheAge?: number | 600000;
        noMainfileClear?: boolean | false;
        autoClearInterval?: number;
    };
    silent?: {
        _all?: boolean;
        addKey?: boolean;
        editKey?: boolean;
        editKeyAdd?: boolean;
        deleteKey?: boolean;
    };
    maxFileSize?: number;
    maxKeysFileSize?: number | 200000;
    actionCallback?: Function;
    moveToKeysFilesChunkSize?: number;
};
