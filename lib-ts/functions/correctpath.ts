import { regexEscape } from "oberknecht-utils";
import path from "path";

export function correctpath(p: string) {
  return p.replace(new RegExp(regexEscape(path.sep), "g"), "/");
}
