import { maxJSONSize } from "../types/jsonsplitter";

export function checkSize(
  file?: object | string | Buffer,
  object?: object | string | Buffer
): boolean {
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

  if (!object && fileBuffer) return fileBuffer.byteLength >= maxJSONSize;
  if (!file && objectBuffer) return objectBuffer.byteLength >= maxJSONSize;
  return fileBuffer.byteLength + objectBuffer.byteLength >= maxJSONSize;
}
