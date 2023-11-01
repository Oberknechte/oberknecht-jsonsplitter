import { i } from "..";
import { _wf } from "./_wf";

export function saveKeysFile(sym: string, keysFilePath: string) {
  let keysFile = i.splitterData[sym].keysFiles[keysFilePath]();

  if (keysFile.hasChanges) delete keysFile.hasChanges;
  _wf(sym, keysFilePath, keysFile);
}
