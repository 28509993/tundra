/**
 * Created by Administrator on 2015/4/19.
 */
var httpProxy = require('http-proxy')
    , http = require('http')
    ,https = require('https')
    ,URL = require('url')
    , fs = require('fs')
    ,util=require('util')
    ,request=require('request')
    ,zlib = require('zlib')
    ,path = require('path')
    ,crypto = require('crypto')
    ,Readable  = require('stream').Readable
    ,extend   = require('util')._extend
    , iconv = require('iconv-lite')
    , BufferHelper = require('bufferhelper')
    , socketIO = require('socket.io')
    ,easyProxy= require('../../../lib/core/easy-proxy')
    ,helper = require('../../../lib/core/helper')
    ,extend=util._extend;

exports=module.exports=function(options) {
    var cacheTask={};
    var cacheImageValue = {};  //{value:,time:} //'iicid':233
    var io = socketIO();
    var taskroom='taskroom';
    var proxyroom='proxyroom';
    var webpass={};
    [
        function Options(req,res){
            res.json(options)
            return true;
        },
        function getImgValue(req,res){
            //from proxy to here
            var seq=req.query.seq;
            var obj;
            if (!seq||!(obj=cacheImageValue[seq])||!obj.value){
                writeError(res);
                return true;
            }
            delete obj['liveTime'];
            delete cacheImageValue[seq];
            res.json(obj)
            return true;
        },
        function imgValue(req,res){
            //from out to here
            var seq=req.query.seq;
            var value=req.query.value;
            if (!seq||!value){
                writeError(res)
                return true;
            }
            cacheImageValue[seq]={value:value,liveTime: helper.nowTime()+30};
            res.json(extend( helper.result(),{seq:seq}));
            return true;
        },
        function validateImg(req,res) {
            //from proxy to out
            //http://localhost:60059/validateImg?seq=232321&oldseq=23232
            //console.log('validateImg demo!');
            //console.log(req.query);
            var oldseq=req.query.oldseq;
            var seq=req.query.seq;
            if (!seq||!oldseq) {
                res.end();
                return true;
            }
            helper.easyResponse(req,res,function(err,data){
                if (err) return ;
                //src.slice(22)
                var base64Data = data.toString().replace(/^data:image\/png;base64,/,"");
                fs.writeFile('c:\\phantomjs\\'+seq+'.png',new Buffer(base64Data,'base64'),function(e){
                });
                var form={'method': 'upload', 'username': 'killzer', 'password': '1233333d',
                    'codetype': '1004', 'timeout': '60','appid':1435,'appkey':'5faa6b096f6ece963723bda4ea5dc46a'};
                form['file']={value:new Buffer(base64Data,'base64'),options:{filename: seq+'.png',contentType: 'image/png'}}
                var url='http://api.yundama.com/api.php';
                //var url='http://localhost:60059/validateImgfile';
                request.post({url:url, formData: form}, function (e, httpResponse, body) {
                    if (e) {
                        writeError(res);
                        return true;
                    }
                    var rst=JSON.parse(body)
                    if (!rst||rst.ret!==0){
                        writeError(res);
                        return true;
                    }
                    res.end();
                    cacheImageValue[seq]={matchid:rst.cid,liveTime: helper.nowTime()+60};
                    //console.log('Upload successful!  Server responded with:', body);
                });
            })
            return true;
        },
        function setTask(req,res){
            //from out to task
            if (!hasTaskerHost()){
                writeError(res)
                return true;
            }
            var task=extend({},req.query);
            task.liveTime=task.liveTime||helper.nowTime()+300;
            task.priority=isNaN(task.priority)?50:parseInt(task.priority);
            task.priority<1&&(task.priority=1);
            task.priority>100&&(task.priority=100);
            cacheTask[task.priority][req.query.seq]=task;
            res.json({result:true,seq:req.query.seq});
            return true;
        },
        function saveTask(req,res){
            helper.easyResponseDecode(req,res,function(err,data){
                if (err) return writeError(res);
                var proxyUrl=options['bizware']+req.url;
                var opts={method:'POST',data:data};
                helper.easyRequest (proxyUrl,function(){
                },opts);
                res.json({result:true});
            })
            return true;
        },
        function getTask(req,res){
            for(var i=100;i>=1;i--){
                var pcache=cacheTask[i];
                var keys=Object.keys(pcache);
                for(var j= 0,n=keys.length;j<n;j++){
                    var task=pcache[keys[j]];
                    delete pcache[keys[j]]; //for test dont delete
                    delete task. liveTime;
                    task.proxyUrls=getProxyerUrls(task);;
                    return res.json(task);
                }
            }
            return res.json({});;
        }
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
    function webRouter(req,res,next) {
        var funcExist;
        var matchs = req.url.match(/^\/([^\/\?]+)[\?]?[^\/]*$/i);
        if (matchs && (funcExist = webpass[matchs[1].toUpperCase()])){
            funcExist(req, res) || writeError(res);
        }
        if (!funcExist) next();
    }

    var wsRouter={};
    [
        function registTasker(io,socket,data) {
            var address=socket.conn.remoteAddress.match(/[:]*[a-zA-Z]*[:]?([.0-9]+)[:]?([0-9]*)$/);
            address=address[1]
            var url='http://'+address+':'+data.port;
            socket.taskerUrl=url;
        },
        function registProxyer(io,socket,data) {
            var address=socket.conn.remoteAddress.match(/[:]*[a-zA-Z]*[:]?([.0-9]+)[:]?([0-9]*)$/);

            address=address[1]
            var data=(data instanceof Array)?data:[];
            data.forEach(function(item){
                item.url=item.url||''
                item.url=item.url.replace(/THIS_HOST/i,address);
                var matchKey=item.busiType+item.keyexpr;
                item.matchKey=matchKey?matchKey:(new Date()).getTime();
            })
            socket.proxyerUrls=data;
        }
    ].forEach(function (func){
            wsRouter[func.name] = func;
        });

    function getProxyerUrls(task){
        var validUrls=[];
        if (!task) return validUrls;
        if (task.proxyerUrls){
            if (typeof task.proxyerUrls ==='string'){
                validUrls.push(task.proxyerUrls)
            }else{
                validUrls= validUrls.concat(task.proxyerUrls)
            }
            return validUrls;
        }
        var sockets= io.of(proxyroom).in(proxyroom).sockets;
        var key1;
        var key2;
        if (task.busiType==='illegal'){
            key1=task.busiType+task.carMark.slice(0,1);
            key2=task.busiType+task.carMark.slice(0,2);
        }
        sockets.forEach(function(socket){
            if (!socket.proxyerUrls) return ;
            socket.proxyerUrls.forEach(function(item){
                if (key1===item.matchKey||key2===item.matchKey){
                    validUrls.push(item);
                }
            })
        });
        return validUrls
    }

    //setInterval(function(){
    //    console.log(getProxyerUrls({"seq":"23232","car_mark":"浙LD792X","car_ident": "065026","cart_ype": "02","busi_type":"illegal"}));
    //},2000)

    function hasTaskerHost(){
        return io.of(taskroom).in(taskroom).sockets.length>0
        /*
        var sockets= io.of(taskroom).in(taskroom).sockets;
        var valids=[];
        for(var i= 0,n=sockets.length;i<n;i++){
            var socket=sockets[i];
            if (socket.id)  valids.push(socket);
        }
        var inx=Math.random()*valids.length>>>0;
        var socket=valids[inx];
        return socket&& socket.taskerUrl;*/
    }



    function bindRoom(room){
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
    }

    bindRoom(taskroom);
    bindRoom(proxyroom);

    function bindSocket(server){
        io.attach(server);
    }

    for(var i=1;i<=100;i++){
        cacheTask[i]={};
    }
    ;!function timeTask(){
        setInterval(function(){
            helper.freeCache(cacheImageValue);
            for(var i=1;i<=100;i++){
                helper.freeCache(cacheTask[i]);
            }
        },10000);
        function validateImgReturn(){
            var arrAll=Object.keys(cacheImageValue);
            function doPost(){
                var validinfo=arrAll.shift();
                if (!validinfo)  return setTimeout(validateImgReturn,3000);
                validinfo=cacheImageValue[validinfo];
                if (!validinfo||validinfo.value||!validinfo.matchid) return doPost();
                var url='http://api.yundama.com/api.php';
                //var url='http://localhost:60059/validateImgfileret';
                helper.easyRequest(url+'?method=result&&cid='+validinfo.matchid,function(e,rst){
                    //console.log(rst)
                     if (!e){
                         var rst=JSON.parse(rst);
                         if (rst.ret===0&&rst.text){
                             validinfo= extend(validinfo, {value:rst.text,liveTime: helper.nowTime()+30});
                         }
                     }
                    return doPost();
                })

            }
            return doPost();
        };
        setTimeout(validateImgReturn,2000);
    }();
    return {webRouter:webRouter,wsRouter:wsRouter,bindSocket:bindSocket}
}
