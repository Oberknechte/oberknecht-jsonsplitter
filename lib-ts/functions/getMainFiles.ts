import { i } from "..";
import { _rf } from "./_rf";
import { getMainPaths } from "./getMainPaths";

export function getMainFiles(sym: string) {
    let mainPaths = getMainPaths(sym);

    let mainFiles = {};

    Object.keys(mainPaths).forEach(dir => {
        mainFiles[dir] = () => {
            if (!i.splitterData[sym]?.actualMainFiles?.[dir]) {
                let file = _rf(sym, dir, true);
                i.splitterData[sym].actualMainFiles[dir] = {...file, lastUsed: Date.now()};
                return file;
            };

            return i.splitterData[sym].actualMainFiles[dir];
        };
    });

    i.splitterData[sym].mainFiles = mainFiles;

    return mainFiles;
};