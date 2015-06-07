/**
 * Created by Administrator on 2015/3/19.
 */


var util=require('util')
    ,path = require('path')
    , express =require('express')
    ,servestatic   = require('serve-static')
    ,favicon = require('serve-favicon')
    , http = require('http')


exports=module.exports=function(options) {
    var routers=require('./router/task-deal')(options)
    var app = express();
    app.use(servestatic('public', {redirect: false}))
        .use(favicon('public/favicon.ico'))
        .use(routers.webRouter);
    return app;
}
