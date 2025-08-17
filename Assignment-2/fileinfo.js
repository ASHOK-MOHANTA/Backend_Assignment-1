const path = require("path");

function detfileinfo(filepath){
    return{
        fileName: path.basename(filepath),
        extension: path.extname(filepath),
        directory:path.dirname(filepath)
    };
}

module.exports = detfileinfo;