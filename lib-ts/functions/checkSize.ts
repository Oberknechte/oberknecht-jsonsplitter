import { i } from "..";
import { maxJSONSize } from "../types/jsonsplitter";
import { debugLog } from "./debugLog";

export function checkSize(
  sym: string,
  file?: object | string | Buffer,
  object?: object | string | Buffer,
  size?: number,
  objectSizeMultiplier?: number
): boolean {
  debugLog(sym, "checkSize", ...arguments);
  if (!file && !object) return false;

  const fileBuffer = !file
    ? undefined
    : Buffer.from(
        typeof file === "object" ? JSON.stringify(file) : file.toString(),
        "utf-8"
      );
  const objectBuffer = !object
    ? undefined
    : Buffer.from(
        typeof object === "object" ? JSON.stringify(object) : object.toString(),
        "utf-8"
      );

  let maxSize =
    size ?? i.splitterData[sym]._options?.maxFileSize ?? maxJSONSize;
  if (maxSize > maxJSONSize || maxSize <= 0) maxSize = maxJSONSize;

  if (!object && fileBuffer) return fileBuffer.byteLength >= maxSize;
  if (!file && objectBuffer)
    return objectBuffer.byteLength * (objectSizeMultiplier ?? 1) >= maxSize;
  return fileBuffer.byteLength + objectBuffer.byteLength >= maxSize;
}
