import { i } from "..";
import { _wf } from "./_wf";
import { debugLog } from "./debugLog";

export function saveKeysFile(sym: string, keysFilePath: string) {
  debugLog(sym, "saveKeysFile", ...arguments);
  let keysFile = i.splitterData[sym].keysFiles[keysFilePath]();

  if (keysFile.hasChanges) delete keysFile.hasChanges;
  _wf(sym, keysFilePath, keysFile);
}
