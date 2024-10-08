export type getFileByKeysReturn = {
    path: string | undefined;
    dirpath: string | undefined;
    dirpaths: string[] | undefined;
    path_main: string | undefined;
    object: Record<string, any> | undefined;
    object_: Record<string, any> | undefined;
    object_main: mainFileType | undefined;
    object_main_: mainFileType | undefined;
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
    keysMoved?: boolean;
};
export type fileEntryType = Record<string, any>;
export type fileType = Record<string, any | fileEntryType>;
export type deleteKeySyncrettype = boolean | undefined;
export declare const maxJSONSize: 4194304;
export declare const defaultKeysFileSize: 200000;
export declare const defaultMoveToKeysFileChunkSize: 1000;
