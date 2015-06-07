/**
 * Created by Administrator on 2015/3/19.
 */


    var util=require('util')
    ,path = require('path')
    , express =require('express')
    ,servestatic   = require('serve-static')
    ,favicon = require('serve-favicon')
    ,autoProxy = require('./auto-proxy')
    , socket = require('socket.io')
    ,wspress=require('../../lib/core/wspress')
    ,helper=require('../../lib/core/helper')

    var saveFileName= {'origin': function (name) {  return path.join(__dirname, 'origin', name)
        }, 'overload': function (name) {     return path.join(__dirname, 'overload', name)    }    };
    var proxyOptions;
var target='http://jjzd.police.zhoushan.gov.cn:6080';
var js='/zj/injected-10580.js'
var keyWord='浙L';
var busiType='illegal';
    ;!function () {
    var mainHtmls = {};
    var blankRegs = [];

    var cacheRegex = /(\/image\/|\/images\/|\.css$|\.js$)/i
    var ignoreRegex
    blankRegs.push(/<script[^>]*>[^<>]+baidu\.com[^<>]+<\/script>/gmi);
    var mainHtmlArray=[];
    var url = '/zzwfcl/vio.do';
    var mainHtml = {url: url,
        origin: saveFileName.origin( 'origin_10580_vio_query.html'),
        overload: saveFileName.overload('overload_10580_vio_query.html'),
        injected: undefined,match:/(act=veh_vio_query)/gi,referer:'http://localhoddst:11111/'};
    mainHtml['injected'] = helper.injectedJs(js);
    mainHtmlArray.push(mainHtml);

    mainHtml =  {url: url, origin: saveFileName.origin( 'origin_10580_vio_save.html'),
        overload: undefined, injected: undefined,match:/(act=veh_vio_save)/gi};
    mainHtml['injected'] = helper.injectedJs(js);
    mainHtmlArray.push(mainHtml);

    mainHtmls[url]=mainHtmlArray;
    proxyOptions = {target:target,mainHtmls: mainHtmls, blankRegs: blankRegs
        , cacheRegex: cacheRegex, ignoreRegex: ignoreRegex,charset:'GBK'}
}();

exports=module.exports=function(options){
    var app=express();
    app.use(servestatic('public',{redirect:false}))
        .use(favicon( 'public/favicon.ico'))
        .use('/',autoProxy(util._extend(proxyOptions,options) ))
    app.keyUrl={keyexpr:keyWord,busiType:busiType, url:keyUrl,injected:[js]}
    app.xTarget=target;
    return app;
}

