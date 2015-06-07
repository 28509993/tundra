/**
 * Created by Administrator on 2015/4/19.
 */
var httpProxy = require('http-proxy')
    , http = require('http')
    ,https = require('https')
    ,URL = require('url')
    , fs = require('fs')
    ,util=require('util')
    ,zlib = require('zlib')
    ,path = require('path')
    ,crypto = require('crypto')
    ,Readable  = require('stream').Readable
    ,extend   = require('util')._extend
    , iconv = require('iconv-lite')
    , BufferHelper = require('bufferhelper')
    ,easyProxy= require('../../../lib/core/easy-proxy')
    ,helper = require('../../../lib/core/helper')
    , socketIO = require('socket.io')
    ,formidable=require('formidable')


exports=module.exports=function(options) {
    var cacheIic = {};  //{value:,time:} //'iicid':233
    var cacheDealHost = {};  //host,url
    var room='iicdemo';
    var webpass={};
    var io = socketIO();
    [
         //validateImgfile
         function validateImgfile(req,res) {
             var form = new formidable.IncomingForm();
             form.encoding = 'utf-8';
             form.uploadDir = 'C:\\phantomjs\\upload\\'
             form.keepExtensions = true;
             form.maxFieldsSize = 2 * 1024 * 1024;
             form.parse(req, function(err, fields, files) {
                 if (err) {
                     console.log('eerrrr');
                 }
                 var extName ='png';
                 var avatarName = Math.random() +'.'+ extName;
                 var newPath = form.uploadDir + files.file.name;
                 res.json({"ret":0,"cid":1000000});
                 fs.renameSync(files.file.path, newPath);
             });
             return true;
         },
         function validateImgfileret(req,res) {
             console.log(req.query);
             res.json({"ret":0,"text":"abcd"});
             return true;
         },
         function validateImg(req,res) {
             //from proxy to out
             //http://localhost:60059/validateImg?seq=232321&oldseq=23232
             //console.log('validateImg demo!');
             var seq=req.query.oldseq;
             var seqimg=req.query.seq;
             if (!seq||!seqimg) {
                 res.end();
                 return true;
             }
             helper.easyResponse(req,res,function(err,data){
                 res.end();
                 if (err) return ;
                 var sck=getSockectBySeq(seq);
                 if (sck){
                     sck.emit('notifyiicSeq',seqimg);
                     sck.emit('validateImg',data.toString());
                 }
             })
             return true;
         },
        function imgValue(req,res){
            var proxyUrl=options['midware'];
            easyProxy(req,res,proxyUrl);

            return true;
        },
        function pageviewXZoom(req,res){
            var seq=req.query.seq;
            if (!seq) {
                res.end();
                return true;
            }
            helper.easyResponse(req,res,function(err,data){
                res.end();
                if (err) return ;
                var sck=getSockectBySeq(seq);
                sck&&sck.emit('pageviewXZoom',data.toString());
            })
            return true;
        },
         function saveTask(req,res) {
             helper.easyResponse(req, res, function (err, data) {
                 res.json(helper.result());
                 if (err) return;
                 var task = JSON.parse(data.toString());
                 var sck = getSockectBySeq(task.seq);
                 sck && sck.emit('saveTask', task);
             })
             return true;
         },
        function setTask(req,res){
            var proxyUrl=options['midware'];
            easyProxy(req,res,proxyUrl);
            return true;
        }
    ].forEach(function(func) {
        webpass[func.name.toUpperCase()]=func;
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

    var wsRouter={};
    [
        function postXIic(io,socket,data) {

            console.log('dddddddddddddddddd')
        },
        function returnXTask(io,socket,data) {

        },
        function bindSeq(io,socket,data){
            socket['bindSeq']=data.seq;


        }
    ].forEach(function (func){
            wsRouter[func.name] = func;
        });

    //var sck=getSockectBySeq(data.seq);
    //sck&&sck.emit('returnXTask',{"room" : "chrome"});
    function getSockectBySeq(seq){
        var sockets= io.of(room).in(room).sockets;
        for(var i= 0,n=sockets.length;i<n;i++){
            var socket=sockets[i];
            if (socket['bindSeq']===seq){
                return socket;
            }
        }
    }

    io.of(room).on('connection', function(socket){
        console.log('connected  from...........'+socket.conn.remoteAddress);
        socket.join(room);
        Object.keys(wsRouter).forEach(function (key) {
            ;!function(event,fn){
                socket.on(event, function(data){
                    fn.call(null,io,socket,data);
                })
            }(key,wsRouter[key]);
        });
        socket.on('disconnect', function () {
            console.log('disconnected  from...........'+socket.conn.remoteAddress);
            socket.leave(room)
        });
    });



    function freeXCache(){
        function deletetimeout(cacheObject,timeout){
            Object.keys(cacheObject).forEach(function (key) {
                var cache=cacheObject[key];
                var tt=((new Date()).getTime()/1000)>>>0;
                if (tt-cache.time>timeout){
                    delete cacheObject[key];
                }
            });
        }
        deletetimeout(cacheIic,30);
    }
    ;!function timeTask(){
        setInterval(function(){
            freeXCache();
        },10000)
    }();

    function loadHtml(req,res,filename){
        var html= fs.readFileSync(filename,'utf8');
        res.writeHeader(200,{'Content-Type' : 'text/html;charset=utf-8'}) ;
        console.log( req.headers['host']);
        res.write(html.replace(/THIS_HOST/gmi, req.headers['host'].split(':')[0]));
        res.end();
    }
    function webRooter(req,res,next){
        if (!(/^\/$/i).test(req.url)) return next();
        res.setHeader("set-cookie", ['a=000', 't=1111', 'w=2222']);
        loadHtml(req,res,path.resolve('app/!public/api-index.html'));
    }
    function webApiDemo(req,res,next){
        if (!(/^\/api_demo.html$/i).test(req.url)) return next();
        loadHtml(req,res,path.resolve('app/!public/api-demo.html'));
    }
    function bindSocket(server){
        io.attach(server);
    }
    return {webRouter:webRouter,webRooter:webRooter,webApiDemo:webApiDemo,bindSocket:bindSocket}
}
