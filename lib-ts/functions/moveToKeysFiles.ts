import { i } from "..";
import fs from "fs";
import { parseKeysFilePath } from "./parseKeysFilePath";
import { addKeyToFileKeys } from "./addKeyToFileKeys";
import { fileChange } from "../handlers/fileChange";
import {
  addKeysToObject,
  chunkArray,
  cleanTime,
  log,
  recreate,
} from "oberknecht-utils";
import { debugLog } from "./debugLog";
import {
  defaultKeysFileSize,
  defaultMoveToKeysFileChunkSize,
  maxJSONSize,
} from "../types/jsonsplitter";
import { _wf } from "./_wf";
import { saveKeysFile } from "./saveKeysFile";

export async function moveToKeysFiles(sym: string, mainFilePath: string) {
  debugLog(sym, "moveToKeysFiles", ...arguments);

  let mainFile = i.splitterData[sym].mainFiles[mainFilePath]?.();

  const moveStart = Date.now();

  log(
    1,
    "Moving keys of mainfile",
    mainFilePath,
    `(Has moved: ${(!mainFile?.keys || mainFile.keysMoved) === true}`,
    `jsonsplitter: ${sym}`
  );
  if (!mainFile?.keys || mainFile.keysMoved) return false;

  let keysFolderPath = parseKeysFilePath(mainFilePath);
  if (!fs.existsSync(keysFolderPath)) fs.mkdirSync(keysFolderPath);

  const chunkCreateStart = Date.now();
  log(1, "Creating Chunks of mainfile", mainFilePath, `jsonsplitter: ${sym}`);
  let maxSize =
    i.splitterData[sym]._options?.maxKeysFileSize ?? defaultKeysFileSize;

  let chunks = [""];

  const chunkSeperator = ";";
  function getSeperator(chunk: string) {
    return chunk.length > 0 ? chunkSeperator : "";
  }

  Object.keys(mainFile.keys).forEach((key) => {
    if (
      Buffer.from(
        chunks.at(-1) +
          getSeperator(chunks.at(-1)) +
          `${key},${mainFile.keys[key]}`
      ).byteLength > maxSize
    )
      chunks.push("");

    chunks[chunks.length - 1] =
      chunks.at(-1) +
      getSeperator(chunks.at(-1)) +
      `${key},${mainFile.keys[key]}`;
  });

  const chunkCreateEnd = Date.now();
  log(
    1,
    `Created ${chunks.length} Chunks of mainfile`,
    mainFilePath,
    `jsonsplitter: ${sym}`,
    // @ts-ignore
    `(Took ${cleanTime(chunkCreateEnd - chunkCreateStart, 4).time.join(" ")})`
  );

  let chunks_ = [];

  chunks.forEach((chunk, i) => {
    chunks_.push({});
    chunk.split(chunkSeperator).forEach((part) => {
      let ps = part.split(",");
      addKeysToObject(chunks_[i], ["keys", ps[0]], ps[1]);
    });
  });

  const chunkRevertEnd = Date.now();
  log(
    1,
    `Reversed ${chunks_.length} Chunks of mainfile`,
    mainFilePath,
    `jsonsplitter: ${sym}`,
    // @ts-ignore
    `(Reverting Took ${cleanTime(chunkRevertEnd - chunkCreateEnd, 4).time.join(
      " "
    )}; Total time took ${cleanTime(
      chunkCreateEnd - chunkCreateStart,
      4
      // @ts-ignore
    ).time.join(" ")})`
  );

  await Promise.all(
    chunks_.map((chunk_) => {
      return new Promise<void>((resolve) => {
        addKeyToFileKeys(sym, mainFilePath, chunk_, true);
        resolve();
      });
    })
  );

  fs.writeFileSync(mainFilePath + ".old", JSON.stringify(mainFile), "utf-8");
  mainFile.keysMoved = true;
  delete mainFile.keys;
  mainFile.hasKeyChanges = true;
  fileChange(sym, true);
  saveKeysFile(
    sym,
    Object.keys(i.splitterData[sym].keysFiles)
      .filter(
        (a) => a.replace(/keys\/keys\d+\.json$/, "_main.json") === mainFilePath
      )
      .sort(
        (a, b) =>
          parseInt(
            a.replace(/.+keys(?=\d+\.json$)/, "").replace(/\.json$/, "")
          ) -
          parseInt(b.replace(/.+keys(?=\d+\.json$)/, "").replace(/\.json$/, ""))
      )
      .at(-1)
  );
  console.log(
    "savekeysfile",
    Object.keys(i.splitterData[sym].keysFiles)
      .filter(
        (a) => a.replace(/keys\/keys\d+\.json$/, "_main.json") === mainFilePath
      )
      .sort(
        (a, b) =>
          parseInt(
            a.replace(/.+keys(?=\d+\.json$)/, "").replace(/\.json$/, "")
          ) -
          parseInt(b.replace(/.+keys(?=\d+\.json$)/, "").replace(/\.json$/, ""))
      )
      .at(-1)
  );

  const moveEnd = Date.now();

  log(
    1,
    "Moved keys of mainfile",
    mainFilePath,
    // @ts-ignore
    `(Took ${cleanTime(moveEnd - moveStart, 4).time.join(" ")})`
  );

  return true;
}
