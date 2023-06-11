import path from "path";

export function uncorrectpath(p: string) {
  return p.replace(/\//g, path.sep);
}
