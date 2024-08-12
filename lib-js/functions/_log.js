"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports._log = _log;
function date_() {
    return new Date(new Date().setMinutes(new Date().getMinutes() - new Date().getTimezoneOffset()))
        .toISOString()
        .split("Z")[0]
        .replace("T", " ");
}
function _log(logopt, logmsg, logcolorfg, logcolorbg) {
    const logcolors = {
        reset: "0",
        bright: "1",
        dim: "2",
        underscore: "4",
        blink: "5",
        reverse: "7",
        hidden: "8",
        fgblack: "30",
        fgred: "31",
        fggreen: "32",
        fgyellow: "33",
        fgblue: "34",
        fgmagenta: "35",
        fgcyan: "36",
        fgwhite: "37",
        bgblack: "40",
        bgred: "41",
        bggreen: "42",
        bgyellow: "43",
        bgblue: "44",
        bgmagenta: "45",
        bgcyan: "46",
        bgwhite: "47",
    };
    const casecolors = {
        fg: { "0": "", "1": "30", "2": "41" },
        bg: { "0": "", "1": "43", "2": "41" },
    };
    logcolorfg = `\x1b[${(logcolorfg ?? 0) == 0
        ? casecolors.fg[logopt ?? 0]
        : logcolors[logcolorfg]
            ? logcolors[logcolorfg]
            : logcolorfg ?? casecolors.fg[logopt ?? 0]}m`;
    logcolorbg = `\x1b[${(logcolorbg ?? 0) == 0
        ? casecolors.bg[logopt ?? 0]
        : logcolors[logcolorbg]
            ? logcolors[logcolorbg]
            : logcolorbg ?? casecolors[logopt ?? 0]}m`;
    const logm = [
        `${logcolorbg}${logcolorfg} ${date_()} \x1b[0m >`,
        ...(!/\[jsonsplitter-\d+\]/i.test(logmsg?.message ?? logmsg)
            ? [`[jsonsplitter]`]
            : []),
        logmsg?.message ?? logmsg,
    ];
    switch (logopt) {
        default:
        case 0:
            return console.log(...logm);
        case 1:
            return console.info(...logm);
        case 2:
            return console.error(...logm);
    }
}
