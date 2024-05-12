import { oberknechtEmitterOptions } from "oberknecht-emitters/lib-ts/types/oberknecht.emitter.options";

export const jsonsplitterOptionsDebugs = [
  "all",
  "_cdir",
  "_mainpath",
  "_rf",
  "_wf",
  "addKeyToFileKeys",
  "checkSize",
  "clearCache",
  "clearCacheSmart",
  "getFiles",
  "getKeyFromKeysFiles",
  "getKeysFiles",
  "getKeysForMainFile",
  "getKeysPaths",
  "getMainFiles",
  "getMainPaths",
  "moveToKeysFiles",
  "removeKeyFromKeysFile",
  "saveKeysFile",
] as const;

export type jsonsplitterOptionsDebugsType = typeof jsonsplitterOptionsDebugs[number];

export type jsonsplitteroptions = {
  child_folders_keys?: number | 1;
  // > folder number before creating file
  // > higher numer = more subfolders (keynames) before single files
  // "store_keys_in_master": Boolean() ?? true,
  debug?: number | 2;
  debugs?: jsonsplitterOptionsDebugsType[];
  debugsLog?: jsonsplitterOptionsDebugsType[];
  debugsWithout?: jsonsplitterOptionsDebugsType[];
  debugsWithoutArgs?: boolean;
  debugsLogDir?: string;
  debugsLogWithout?: jsonsplitterOptionsDebugsType[];
  debugsLogWithoutArgs?: boolean;
  debugsLogWithoutStack?: boolean;
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
  maxFileSize?: number; // In bytes
  maxKeysFileSize?: number | 200000; // In bytes
  actionCallback?: Function;
  moveToKeysFilesChunkSize?: number;
  preloadKeysFiles?: boolean;
  emitterOptions?: oberknechtEmitterOptions;
  backupEnabled?: boolean;
  backupPath?: string; // otherwise the base name + -backups
  backupInterval?: number | "hourly" | "daily" | "weekly";
  backupZip?: boolean; // creates zips instead of copying the folders
  backupNumMax?: number; // only keeps this number of backups, deletes oldest
  backupOnStart?: boolean;
  backupDir?: string;
  resetOnStart?: boolean;
};
