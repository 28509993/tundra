


var http = require('http')
    ,path = require('path')
    , fs = require('fs')
    ,options=require('./setting.json')
    ,helper=require('./lib/core/helper')

helper.initLog(options.log);
var logger=helper.getLogger();

var startServer=helper.startServerHander(options);

startServer(require('./app/platform/app-mid'),60001);
