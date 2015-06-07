

var http = require('http')
    ,path = require('path')
    , fs = require('fs')
    ,options=require('./setting.json')
    ,helper=require('./lib/core/helper')

helper.initLog(options.log);
var logger=helper.getLogger();

var startServer=helper.startServerHander(options);


startServer(require('./app/platform/app-task'),60011);
var notifyurl=options['midware']+'/taskroom';
var notifymsg={event:"registTasker",data:{port:60011}};
setTimeout(function(){helper.nodifyMidware(options,notifyurl,notifymsg)},1500)

