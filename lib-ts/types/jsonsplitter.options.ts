export type jsonsplitteroptions = {
  child_folders_keys?: number | 1;
  // > folder number before creating file
  // > higher numer = more subfolders (keynames) before single files
  // "store_keys_in_master": Boolean() ?? true,
  debug?: number | 2;
  max_keys_in_file?: number | 3000;
  // > keys of parent object are less then number create file
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
};
