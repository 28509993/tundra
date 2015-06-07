

var http = require('http')
    ,path = require('path')
    , fs = require('fs')
var readable = fs.createReadStream( path.resolve("app/zj/injected/!injected-19571.js") );
var writable = fs.createWriteStream( path.resolve("public/zj/injected-19571.js") );
readable.pipe( writable );
