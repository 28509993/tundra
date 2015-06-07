/**
 * Created by Administrator on 2015/5/25.
 */

var http = require('http')
    ,path = require('path')
    , fs = require('fs')
    ,options=require('./setting.json')
    ,helper=require('./lib/core/helper')
    , express =require('express')
    ,servestatic   = require('serve-static')
    ,favicon = require('serve-favicon')


var reactapp=function(options) {
    var app = express();
    app.use(servestatic('react', {redirect: false}))
        .use(servestatic('vendor', {redirect: false}))
        .use(favicon('public/favicon.ico'))
    return app;
}

helper.initLog(options.log);
var logger=helper.getLogger();

var startServer=helper.startServerHander(options);



startServer(reactapp,41001);

//
//http://www.ruanyifeng.com/blog/2015/03/react.html
//http://javascript.ruanyifeng.com/advanced/ecmascript6.html
//http://wiki.jikexueyuan.com/list/react/
//
//http://facebook.github.io/react/docs/tutorial.html
//http://www.cnblogs.com/yunfeifei/p/4486125.html
//http://reactjs.cn/react/docs/addons.html
//watchify reactify
//"watch": "watchify --debug index.js -o bundle.js"   需要运行npm run build，运行npm run watch
//watchify main.js -o static/bundle.js
//rowserify --debug app.js > bundle.js
////http://my.oschina.net/leogao0816/blog/379488
//http://segmentfault.com/a/1190000002670661
//http://www.tuicool.com/articles/ii6Nn2
//http://wenku.it168.com/d_001616365.shtml