/**
 * Created by Administrator on 2015/3/25.
 */
var express =require('express')
    ,httpProxy = require('http-proxy')
exports=module.exports=function(options){
    var app=express();
    ///smhdpt/queryDs.jhtml?query=浙A'
    app.use('/',function(req,res,next){
        var proxy = httpProxy.createProxyServer({target:'http://www.hzcgw.gov.cn:8081'});
        proxy.on('error', function(err) {
            console.log(err);
        });
        proxy.web(req, res);
    });
    return app;
}