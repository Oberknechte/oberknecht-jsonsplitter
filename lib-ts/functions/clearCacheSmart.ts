import { i } from "..";
import { _log } from "./_log";

export function clearCacheSmart(sym: string, excludeMainFiles?: boolean) {
  if (i.splitterData[sym]._options?.debug >= 2)
    _log(0, `[CACHE] [SMART] Clearing`);
  let clearedFiles = 0;
  let clearedMainFiles = 0;

  Object.keys(i.splitterData[sym].actualFiles).forEach((a) => {
    let b = i.splitterData[sym].actualFiles[a];

    if (
      b.lastUsed &&
      b.lastUsed <=
        Date.now() - i.splitterData[sym]._options.cacheSettings.maxFileCacheAge
    ) {
      clearedFiles++;
      delete i.splitterData[sym].actualFiles[a];
    }
  });

  if (
    !(
      excludeMainFiles ??
      i.splitterData[sym]._options.cacheSettings.noMainfileClear
    )
  ) {
    Object.keys(i.splitterData[sym].actualMainFiles).forEach((a) => {
      let b = i.splitterData[sym].actualMainFiles[a];

      if (
        b.lastUsed &&
        b.lastUsed <=
          Date.now() -
            i.splitterData[sym]._options.cacheSettings.maxMainFileCacheAge
      ) {
        clearedMainFiles++;
        delete i.splitterData[sym].actualMainFiles[a];
      }
    });
  }

  let filesnum = Object.keys(i.splitterData[sym].actualFiles).length;
  let mainfilesnum = Object.keys(i.splitterData[sym].actualMainFiles).length;

  if (i.splitterData[sym]._options?.debug >= 2)
    _log(
      0,
      `[CACHE] [SMART] Cleared ${clearedFiles} Files (${
        filesnum + clearedFiles
      } → ${filesnum}) and ${clearedMainFiles} Mainfiles (${
        mainfilesnum + clearedMainFiles
      } → ${mainfilesnum})`
    );
}
