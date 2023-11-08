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
  defaultMoveToKeysFileChunkSize,
  maxJSONSize,
} from "../types/jsonsplitter";

export async function moveToKeysFiles(sym: string, mainFilePath: string) {
  debugLog(sym, "moveToKeysFiles", ...arguments);

  let mainFile = i.splitterData[sym].mainFiles[mainFilePath]?.();

  const moveStart = Date.now();

  log(
    1,
    "Moving keys of mainfile",
    mainFilePath,
    (!mainFile?.keys || mainFile.keysMoved) === true
  );
  if (!mainFile?.keys || mainFile.keysMoved) return false;

  let keysFolderPath = parseKeysFilePath(mainFilePath);
  if (!fs.existsSync(keysFolderPath)) fs.mkdirSync(keysFolderPath);

  let lastTimes: number[] = [];

  log(1, "Creating Chunks of mainfile");
  let maxSize = i.splitterData[sym]._options?.maxFileSize ?? maxJSONSize;

  let chunks = [""];

  const chunkSeperator = ";";
  function getSeperator(chunk: string){
    return chunk.length > 0 ? chunkSeperator : ""
  }

  Object.keys(mainFile.keys).forEach((key) => {
    if (
      Buffer.from(
        chunks.at(-1) + getSeperator(chunks.at(-1)) + `${key},${mainFile.keys[key]}`
      ).byteLength > maxSize
    )
      chunks.push("");

    chunks[chunks.length-1] = chunks.at(-1) + getSeperator(chunks.at(-1)) + `${key},${mainFile.keys[key]}`;
  });

  log(1, "Created Chunks of mainfile");

  await Promise.all(
    chunks.map(async (chunk) => {
      return new Promise<void>((resolve) => {
        addKeyToFileKeys(sym, mainFilePath, chunk);
        resolve();
      });
    })
  );

  // await Promise.all(
  //   chunkArray(
  //     Object.keys(mainFile.keys),
  //     i.splitterData[sym]?._options?.moveToKeysFilesChunkSize ??
  //       defaultMoveToKeysFileChunkSize
  //   ).map(async (chunk) => {
  //     return new Promise<void>((resolve) => {
  //       let vals = chunk.map((key) => mainFile.keys[key]);
  //       lastTimes.push(Date.now());
  //       addKeyToFileKeys(sym, mainFilePath, chunk, vals);
  //       resolve();
  //     });
  //   })
  // );

  // Object.keys(mainFile.keys).map((key) => {
  //   let val = mainFile.keys[key];
  //   lastTimes.push(Date.now());
  //   addKeyToFileKeys(sym, mainFilePath, key, val);
  // });

  delete mainFile.keys;
  mainFile.hasKeyChanges = true;
  fileChange(sym, true);

  const moveEnd = Date.now();

  log(
    1,
    "Moved keys of mainfile",
    mainFilePath,
    // @ts-ignore
    `(Took ${cleanTime(moveEnd - moveStart, 4).time.join("")})`
  );

  return true;
}
