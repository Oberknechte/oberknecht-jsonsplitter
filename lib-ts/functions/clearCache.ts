import { i } from "..";
import { _log } from "./_log";
import { debugLog } from "./debugLog";

export function clearCache(sym: string, excludeMainFiles?: boolean) {
  debugLog(sym, "clearCache", ...arguments);
  if (i.splitterData[sym]._options?.debug > 2) _log(0, `[CACHE] Clearing`);

  i.splitterData[sym].actualFiles = {};
  if (
    !(
      excludeMainFiles ??
      i.splitterData[sym]._options.cacheSettings.noMainfileClear
    )
  )
    i.splitterData[sym].actualMainFiles = {};
}
