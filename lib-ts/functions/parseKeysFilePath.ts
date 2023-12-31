import { convertToArray } from "oberknecht-utils";
import path from "path";
import { correctpath } from "./correctpath";

export function parseKeysFilePath(
  mainFilePath: string,
  pathParts?: string | string[]
) {
  return correctpath(
    path.resolve(
      mainFilePath.replace(/\/_main\.json$/, ""),
      "./keys",
      ...convertToArray(pathParts, false)
    )
  );
}
