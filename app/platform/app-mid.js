/**
 * Created by Administrator on 2015/3/19.
 */


var util=require('util')
    ,path = require('path')
    , express =require('express')
    ,servestatic   = require('serve-static')
    ,favicon = require('serve-favicon')
    , http = require('http')
   // , socket = require('socket.io')
    //,wspress=require('../../lib/core/wspress')


exports=module.exports=function(options) {
    var routers=require('./router/mid-ware')(options)
    //var wsRouter=midWare.wsRouter;
    var app = express();
    app.use(servestatic('public', {redirect: false}))
        .use(favicon('public/favicon.ico'))
        .use(routers.webRouter);
    app.bindSocket=routers.bindSocket;
    return app;
}

//http://www.tuicool.com/articles/zQVrq2


