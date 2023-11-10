"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.debugLog = void 0;
const oberknecht_utils_1 = require("oberknecht-utils");
const __1 = require("..");
const _mainpath_1 = require("./_mainpath");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
let fileName;
let appendLogs = [];
let appendLogTriggered = false;
function debugLog(sym, debugName, ...functionArgs) {
    if (__1.i.splitterData[sym]?._options?.debugs?.some((a) => [debugName, "all"].includes(a) &&
        !__1.i.splitterData[sym]._options.debugsWithout?.includes(debugName)))
        (0, oberknecht_utils_1.log)(0, sym, `Executed function`, debugName, ...(!__1.i.splitterData[sym]._options.debugsWithoutArgs
            ? functionArgs.filter((a) => a !== sym)
            : []));
    if (__1.i.splitterData[sym]?._options?.debugsLogDir &&
        !__1.i.splitterData[sym]?._options?.debugLogs?.some((a) => [debugName, "all"].includes(a) &&
            !__1.i.splitterData[sym]._options.debugsLogsWithout?.includes(debugName))) {
        appendLogs.push([
            [
                sym,
                Date.now(),
                debugName,
                ...(!__1.i.splitterData[sym]._options.debugsLogWithoutArgs
                    ? [
                        functionArgs.map((a) => typeof a !== "string"
                            ? typeof a === "object"
                                ? JSON.stringify(a)
                                : a?.toString()
                            : a),
                    ]
                    : []),
                ...(!__1.i.splitterData[sym]._options.debugsLogWithoutStack
                    ? ["\n", Error("logpath").stack.toString()]
                    : []),
            ].join(" "),
        ].join(""));
    }
    async function appendDebugLogs() {
        appendLogTriggered = true;
        if (appendLogs.length === 0)
            return (appendLogTriggered = false);
        let debugsLogDir = (0, _mainpath_1._mainpath)(sym, __1.i.splitterData[sym]._options.debugsLogDir);
        if (!fs_1.default.existsSync(debugsLogDir))
            fs_1.default.mkdirSync(debugsLogDir, { recursive: true });
        if (!fileName)
            fileName = `${sym}-${Date.now()}.log`;
        let filePath = path_1.default.resolve(debugsLogDir, fileName);
        let appendLogs_ = appendLogs.splice(0, appendLogs.length);
        fs_1.default.appendFileSync(filePath, appendLogs_.join("\n"));
        (0, oberknecht_utils_1.sleep)(5000).then(() => {
            appendDebugLogs();
        });
    }
    if (appendLogTriggered === false)
        appendDebugLogs().catch((e) => console.error(e));
}
exports.debugLog = debugLog;
