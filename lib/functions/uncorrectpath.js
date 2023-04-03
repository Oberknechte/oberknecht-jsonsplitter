const regexescape = require("regex-escape");
const path = require("path");

function uncorrectpath(p) {
    return p.replace(/\//g, path.sep);
};

module.exports = uncorrectpath;