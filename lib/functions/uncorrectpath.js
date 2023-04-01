const regexescape = require("regex-escape");
const path = require("path");

function uncorrectpath(p) {
    return p.replace(/\//g, regexescape(path.sep));
};

module.exports = uncorrectpath;