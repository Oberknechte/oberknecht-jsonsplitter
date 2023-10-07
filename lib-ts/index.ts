const NodeCache = require("node-cache");

export class i {
  static splitterData: Record<string, any> = {};
  static oberknechtEmitter: Record<string, any> = {};
  static cache = new NodeCache();
}