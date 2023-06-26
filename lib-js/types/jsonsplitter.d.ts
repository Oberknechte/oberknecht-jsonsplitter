export type getFileByKeysReturn = {
    path: string | undefined;
    dirpath: string | undefined;
    dirpaths: string | undefined;
    path_main: string | undefined;
    object: Record<string, any> | undefined;
    object_: Record<string, any> | undefined;
    object_main: Record<string, any> | undefined;
    object_main_: Record<string, any> | undefined;
    keyfound: boolean;
    filenum: number | undefined;
    keys: string | string[];
    leftkeys: string[];
    keynamesmatched: boolean;
};
export type mainFileEntry = Record<string, number>;
export type mainFileType = {
    keys: mainFileEntry[];
    filenum: number;
    filekeynum: number;
    num: number;
    keynames: string[];
    hasChanges?: string[];
};
export type fileEntryType = Record<string, any>;
export type fileType = Record<string, any | fileEntryType>;
export type deleteKeySyncrettype = boolean | undefined;
