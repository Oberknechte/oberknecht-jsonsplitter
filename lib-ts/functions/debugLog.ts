import { log, sleep } from "oberknecht-utils";
import { i } from "..";
import { _mainpath } from "./_mainpath";
import path from "path";
import fs from "fs";
let fileName;
let appendLogs = [];
let appendLogTriggered = false;

export function debugLog(sym: string, debugName: string, ...functionArgs: any) {
  if (
    i.splitterData[sym]?._options?.debugs?.some(
      (a) =>
        [debugName, "all"].includes(a) &&
        !i.splitterData[sym]._options.debugsWithout?.includes(debugName)
    )
  )
    log(
      0,
      sym,
      `Executed function`,
      debugName,
      ...(!i.splitterData[sym]._options.debugsWithoutArgs
        ? functionArgs.filter((a) => a !== sym)
        : [])
    );

  if (
    i.splitterData[sym]?._options?.debugsLogDir &&
    (
      i.splitterData[sym]?._options?.debugsLog ??
      i.splitterData[sym]?._options?.debugs
    )?.some(
      (a) =>
        [debugName, "all"].includes(a) &&
        !i.splitterData[sym]._options.debugsLogWithout?.includes(debugName)
    )
  ) {
    appendLogs.push(
      [
        [
          sym,
          Date.now(),
          debugName,
          ...(!i.splitterData[sym]._options.debugsLogWithoutArgs
            ? [
                functionArgs.map((a) =>
                  typeof a !== "string"
                    ? typeof a === "object"
                      ? JSON.stringify(a)
                      : a?.toString()
                    : a
                ),
              ]
            : []),
          ...(!i.splitterData[sym]._options.debugsLogWithoutStack
            ? ["\n", Error("logpath").stack.toString()]
            : []),
        ].join(" "),
      ].join("")
    );
  }

  async function appendDebugLogs() {
    appendLogTriggered = true;
    if (appendLogs.length === 0) return (appendLogTriggered = false);
    let debugsLogDir = _mainpath(
      sym,
      i.splitterData[sym]._options.debugsLogDir
    );
    if (!fs.existsSync(debugsLogDir))
      fs.mkdirSync(debugsLogDir, { recursive: true });
    if (!fileName) fileName = `${sym}-${Date.now()}.log`;
    let filePath = path.resolve(debugsLogDir, fileName);
    let appendLogs_ = appendLogs.splice(0, appendLogs.length);
    fs.appendFileSync(filePath, appendLogs_.join("\n"));

    sleep(5000).then(() => {
      appendDebugLogs();
    });
  }

  if (appendLogTriggered === false)
    appendDebugLogs().catch((e) => console.error(e));
}
