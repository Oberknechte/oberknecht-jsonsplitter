import { i } from "..";
import { _wf } from "./_wf";
import { debugLog } from "./debugLog";
import { uncorrectpath } from "./uncorrectPath";

export function saveKeysFile(sym: string, keysFilePath: string) {
  debugLog(sym, "saveKeysFile", ...arguments);
  let keysFile =
    i.splitterData[sym].keysFiles[keysFilePath]?.() ??
    i.splitterData[sym].actualKeysFiles[keysFilePath];

  if (keysFile.hasChanges) delete keysFile.hasChanges;
  _wf(sym, uncorrectpath(keysFilePath), keysFile);
}
