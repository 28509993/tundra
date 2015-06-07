/**
 * Created by Administrator on 2015/4/23.
 */

var exec = require('child_process').exec
    ,path = require('path')
    ,util = require('util')
    ,fs = require('fs')
    ,helper = require('../../../lib/core/helper')
    ,TaskManage = require('./task-manage')
    ,extend   = util._extend
    , BufferHelper = require('bufferhelper')
    , qs = require('querystring')
var success= {TResult:"success"};
var failure= {TResult:"failure"};
exports=module.exports=function(options) {
    var cacheCookies=[];//{file:'' ,unique}
    var cacheTasks={};              //unique
    var cookiedir

    /*
    * { seq: '23232',
     car_mark: '浙BD792X',
     car_ident: '065026',
     cart_ype: '02',
     busi_type: 'illegal',
     unique: 4219880780,
     proxyUrls: [ 'http://127.0.0.1:19571/was/portals/car_lllegal_query.jsp' ],
     cookiefile: 'c:\\phantomjs\\cookies\\9320\\4219880780.txt',
     timeout: 1429775735 }
    * */

    ;!function(){
        var configs=options.phantom||{};
        var filename=configs['cookies-file']||'/';
        cookiedir=path.resolve( filename+'/' +process. pid);
    }();


    function getMatchXTaskUrls(task,fn) {
        var midurl=options['midware']+'/matchXTaskUrls?'+qs.stringify(task);
        helper.easyRequest(midurl,fn)
    }

    function getCacheTasks(){
        return cacheTasks;
    }

    function manageUseCache(task){
        var cookie;
        for (var i= 0,n=cacheCookies.length;i<n;i++){
            var c=cacheCookies[i]
            if (!c.unique){
                cookie=c;
            }
        }
        if (!cookie){
            var filename=path.resolve( cookiedir+'/'+task.unique+'.txt');
            cookie ={file:filename}
            cacheCookies.push(cookie);
        }
        cookie['unique']=task.unique;
        task.cookiefile=cookie.file;
        task.timeout=helper.nowTime()+60*3*task.proxyUrls.length
        cacheTasks[task.unique]=task;
    }

    function manageFreeCache(task){
        if (!cacheTasks[task.unique]) return ;
        delete cacheTasks[task.unique];
        for (var i= 0,n=cacheCookies.length;i<n;i++){
            var c=cacheCookies[i];
            if (c.unique===task.unique){
                delete c.unique;
            }
        }
    }


    function startPhantom(task) {
        manageUseCache(task);
        copyCookiefile(task)
        cmdPhantom(task);
        console.log('-----------task')
        console.log(task)
        console.log('-----------task')
    }

    function copyCookiefile(task){
        var dest=task.cookiefile;
        var src=task.cookiefile+'.tmp';
        if (fs.existsSync(src)){
            fs.writeFileSync(dest, fs.readFileSync(src));
        }
    }

    function cmdPhantom(task){
        var cmdloader='phantomjs --web-security=no';
        cmdloader+=' --cookies-file='+task.cookiefile;
        //cmdloader +=' '+ path.resolve('phantom/phloader.js')
        cmdloader +=' '+ path.resolve('phantom/phtest.js')
        cmdloader+=' '+task.unique;
        cmdloader+=' '+task.mainHost;
        console.log(cmdloader);
        var exetask = exec(cmdloader);
        var strdata='';
        exetask.stdout.on('data', function (data) {
            strdata = strdata + data;
        });
        exetask.on('error', function (e) {
            console.log(e);

        });
        exetask.on('exit', function (code) {
            console.log(code+'--code---');
            console.log(strdata);

            var freetask=cacheTasks[task.unique];
            if (!freetask) return ;
            manageFreeCache(freetask);
            var midurl=options['bizware']+'/returnXTask?'+qs.stringify(task);
            extend(freetask,failure)
            trimTaskRaw(freetask);
            freetask.phantom=code+'';
            var opt= {method:'POST',data:freetask}
            opt.headers = {
                'Content-Type': 'application/json'
            };
            helper.easyRequest(midurl,function(e,d){
                console.log(d);
            },opt)


        });
    }

    function trimTaskRaw(task){
        task['mainHost']&&delete task['mainHost'];
        task['cookiefile']&&delete task['cookiefile'];
        task['timeout']&&delete task['timeout'];
        task['unique']&&delete task['unique'];
        task['proxyUrls']&&delete task['proxyUrls'];
        task['DEBUG']&&delete task['DEBUG'];
    }

    return {getMatchXTaskUrls:getMatchXTaskUrls,startPhantom:startPhantom,getCacheTasks:getCacheTasks,manageFreeCache:manageFreeCache}
}

