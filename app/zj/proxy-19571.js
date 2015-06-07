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
    var target='http://www.zjsgat.gov.cn:8080';
    var js='/zj/injected-19571.js'
    var keyWord='浙';
    var busiType='illegal';
    ;!function () {
    var mainHtmls = {};
    var blankRegs = [];

    var cacheRegex = /(\/image\/|\/images\/|\.css$|\.js$)/i
    var ignoreRegex = /(shortcut\.js|checkbox\.js)/i

    blankRegs.push(/<script[^>]*>[^<>]+baidu\.com[^<>]+<\/script>/gmi);
    blankRegs.push(/<noscript[^>]*>[\s\S]+<\/noscript>/gmi);
    blankRegs.push(/<script[^>]*abcfffgh\.js[^<>]+><\/script>/gmi);
    blankRegs.push(/<iframe[^>]*rmwb\.html[^<>]+><\/iframe>/gmi);
    blankRegs.push(/onkeyup="showRight\(\);"/gi);
    blankRegs.push(/<[^>]*?weixin[^>]*>/gim);
    blankRegs.push(/<script[^>]*>[^<|>]+weixin[^<>]+<\/script>/gmi);
    blankRegs.push(/src="\.\.\/Kaptcha\.jpg"/gim);
    var url =keyUrl= '/was/portals/car_lllegal_query.jsp';
    var mainHtml = mainHtmls[url] = {url: url,
        origin: saveFileName.origin( 'origin_19571_lllegal_query.html'),
        overload: saveFileName.overload('overload_19571_lllegal_query.html'),
        injected: undefined};
    mainHtml['injected'] = helper.injectedJs(js);

    url = '/was/common.do';
    mainHtml = mainHtmls[url] = {url: url, origin: saveFileName.origin( 'origin_19571_common_result.html'),
        overload: undefined, injected: undefined};
    mainHtml['injected'] = helper.injectedJs(js);;

    url = '/was/portals/checkManyYzm.jsp';
    mainHtmls[url] = {url: url, overload: undefined, injected: undefined, must200: true};
    proxyOptions = {target:target,mainHtmls: mainHtmls, blankRegs: blankRegs
        , cacheRegex: cacheRegex, ignoreRegex: ignoreRegex,charset:'GBK'}
}();

exports=module.exports=function(options){
    var app=express();
    app.use(servestatic('public',{redirect:false}))
        .use(favicon( 'public/favicon.ico'))
        .use('/',autoProxy(util._extend(proxyOptions,options) ));
    app.keyUrl={keyexpr:keyWord,busiType:busiType, url:keyUrl,injected:[js]}
    app.xTarget=target;
    return app;
}