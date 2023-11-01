import { convertToArray } from "oberknecht-utils";
import path from "path";

export function parseKeysFilePath(
  mainFilePath: string,
  pathParts?: string | string[]
) {
  return path.resolve(
    mainFilePath.replace(/\/_main\.json$/, ""),
    "./keys",
    ...convertToArray(pathParts, false)
  );
}
