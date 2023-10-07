import { convertToArray } from "oberknecht-utils";

export function joinCacheKeyPath(keypath) {
  return convertToArray(keypath).join(",");
}
