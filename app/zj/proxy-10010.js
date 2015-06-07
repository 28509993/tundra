/**
 * Created by Administrator on 2015/3/19.
 */


    var util=require('util')
    ,path = require('path')
    , express =require('express')
    ,servestatic   = require('serve-static')
    ,favicon = require('serve-favicon')
    ,autoProxy = require('./auto-proxy')
    ,helper=require('../../lib/core/helper')

    var saveFileName= {'origin': function (name) {  return path.join(__dirname, 'origin', name)
        }, 'overload': function (name) {     return path.join(__dirname, 'overload', name)    }    };
    var proxyOptions;
    ;!function () {
    var mainHtmls = {};
    var blankRegs = [];
    var target='http://www.bjjtgl.gov.cn';
    var cacheRegex = /(\/image\/|\/images\/|\.css$|\.js$)/i
    var ignoreRegex
    blankRegs.push(/<script[^>]*>[^<>]+baidu\.com[^<>]+<\/script>/gmi);
    var injs = autoProxy.getInjectedHtml()
        + ' <script type="text/javascript" src="/zj/injected-10010.js"></script>';


    var url = '/weifachaxun/wfcxnew.htm';
    var mainHtml = {url: url,
        origin: saveFileName.origin( 'origin_10010_vio_query.html'),
        overload: saveFileName.overload('overload_10010_vio_query.html'),
        injected: undefined,headers:undefined};
    mainHtml['injected'] = injs;
    mainHtml['headers'] = {origin:'http://www.bjjtgl.gov.cn'};


    mainHtmls[url]=mainHtml;
    proxyOptions = {target:target,mainHtmls: mainHtmls, blankRegs: blankRegs
        , cacheRegex: cacheRegex, ignoreRegex: ignoreRegex,charset:'GBK'}
}();

function nextquerytask(req,res,next) {
    if (req.url!=='/car/nextquerytask')
    {
        return next();
    }
    //res.send({carid:'浙AAK964',carno: '018107',cartype: '02'});
    res.send({carid:'浙BD792X',carno: '065026',cartype: '02'});
}

exports=module.exports=function(options){
    var app=express();
    app.use(servestatic('public',{redirect:false}))
        .use(favicon( 'public/favicon.ico'))
        .use('/',nextquerytask)
        .use('/',autoProxy(util._extend(proxyOptions,options) ))
        .use(function (req, res,next){

        })

    return app;
}




//blankReg=/<td.+[\>] ([\s\S]+baidu[\s\S]+)<\/td>/gmi;
//blankReg=/(?:<(\w+?)>)([^<]+)(?=<\/\1>)/gi //good
//blankReg=/(?:<(td)[^>]*>)((?!baidu).)(?=<\/\1>)/gi //good

//(?<=\<abc\>)[^<,^>](?=\</abc\>)
//学习http://www.jb51.net/article/52491.htm
//^(?!.*hello)

/*
 var matchs;
 var str = fs.readFileSync(path.join( __dirname,'origin_car_lllegal_query.html'),'utf8');
 var blankReg=  /src="\.\.\/Kaptcha\.jpg"/gim
 while((matchs = blankReg.exec(str)) !=null){
 console.log(matchs[0]+'---'+matchs[1]+'---'+matchs[2]+'---'+matchs[3]+'=='+matchs.length);
 }
 str.replace(blankReg, "$1    " );
 */

/*
 var socketoptions = {
 'force new connection': true,
 reconnect: true,
 'reconnection delay': 500
 //'max reconnection attempts': 10
 };*/