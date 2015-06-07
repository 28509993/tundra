/**
 * Created by Administrator on 2015/4/19.
 */

var exec = require('child_process').exec
    ,path = require('path')
    ,os = require('os')
    ,util = require('util')
    ,fs = require('fs')
    ,helper = require('../../../lib/core/helper')
    ,TaskManage = require('./task-manage')
    ,extend   = util._extend
    ,easyProxy= require('../../../lib/core/easy-proxy')
    , BufferHelper = require('bufferhelper')
    ,EE = require('events').EventEmitter
var success= {TResult:"success"};
var failure= {TResult:"failure"};
exports=module.exports=function(options) {
    var webpass={};
    [
    ].forEach(function(func) {
            webpass[func.name.toUpperCase()] = func;
        });

    function writeError(res,err){
        var errcode=500;
        if (err){
            if (typeof(err)==='number'){
                errcode=err;
            }else{

            }
        }
        res.writeHead(errcode);
        res.end();
        return true;
    }
    function webRouter(req,res,next){
        var funcExist;
        var matchs = req.url.match(/^\/([^\/\?]+)[\?]?[^\/]*$/i);
        if (matchs && (funcExist = webpass[matchs[1].toUpperCase()])){
            funcExist(req, res) || writeError(res);
        }
        if (!funcExist) next();
    }

    var maxProcessCount=options.phantom.maxProcessCount||20;;
    var ee=new EE();
    var curProcessCount=0;
    var minProcessCount=2;
    var spawn = require('child_process').spawn;
    function cmdPhantom(){
        var exetask = spawn('phantomjs',['--web-security=no',path.resolve('phantom/phmain.js'),options.midware]);
        curProcessCount++;

        exetask.stdout.on('data', function (data) {
            console.log(data.toString());
        });
        exetask.on('error', function (e) {
            console.log(e);
        });
        exetask.on('exit', function (code) {
            console.log(code+'--code---');
            curProcessCount--;
            ee.emit('phantom');
        });
    }

    ee.on('phantom',function(num){
        var n=num||0;
        var minnum=minProcessCount-curProcessCount;
        n=n<=minnum?minnum:n;
        for (var i= 0;i<n;i++){
            if (curProcessCount>=maxProcessCount) return ;
            cmdPhantom();
        }
    })

    //ee.emit('phantom',minProcessCount);
    //ee.emit('phantom',10);
    ee.emit('phantom');
    return {webRouter:webRouter}
}
