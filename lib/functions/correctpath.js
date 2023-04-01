const regexescape = require("regex-escape");
const path = require("path");

function correctpath(p) {
    return p.replace(new RegExp(regexescape(path.sep), "g"), "/");
};

module.exports = correctpath;