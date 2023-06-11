export type jsonsplitteroptions = {
    child_folders_keys?: number | 1;
    debug?: number | 2;
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
    silent: {
        _all?: boolean;
        addKey?: boolean;
        editKey?: boolean;
        editKeyAdd?: boolean;
        deleteKey?: boolean;
    };
};
