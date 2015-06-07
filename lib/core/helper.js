/**
 * Created by Administrator on 2015/4/23.
 */

var http = require('http')
    ,path = require('path')
    , fs = require('fs')
    , util = require('util')
    , BufferHelper = require('bufferhelper')
    ,  log4js = require('log4js');

var  proxyNotify={data:[],started:false};
exports.startServerHander=function(options){
    return function(appFn,port,timeout){
        var timeout=timeout||60000;
        var app=appFn(options);
        var server=http.createServer(app)
        app.bindSocket&&app.bindSocket(server);
        server.setTimeout(timeout);
        setTimeout(function(){ server.listen(port,function(){
            console.log('Server runing at port:'+port);
        }); },200);
        if (options.isAutoProxy){
            if (app.keyUrl&&app.xTarget){
                app.keyUrl.url=app.xTarget.match(/^http[s]?:\/\//i)[0]+'THIS_HOST:'+port+app.keyUrl.url;
                proxyNotify.data.push(app.keyUrl);
            }
            if (!proxyNotify.started){
                proxyNotify.started=true;
                var notifyurl=options['midware']+'/proxyroom';
                var notifymsg={event:"registProxyer",data:proxyNotify.data};
                setTimeout(function(){exports.nodifyMidware(options,notifyurl,notifymsg)},2000)
            }
        }

    }

}


exports.nodifyMidware =function(options,url,message,midClient) {
    var socketIOClient = require('socket.io-client')
    var midClient=midClient;
    var wsoptions = {
        'forceNew': true,
        reconnection: true,
        'reconnectionDelay': 500};
    if (!message) return;
    if (!midClient){
        midClient = socketIOClient.connect(url, wsoptions);
        midClient.on('connect', function () {
            midClient.emit(message.event, message.data)
        })
        setInterval(function () {
            midClient.emit(message.event, message.data)
        },60000);
    }else{
        midClient.emit(message.event, message.data)
    }
    return midClient;
}

exports. hash=function(str) {
    var hash = 5381,
        i    = str.length
    while(i)
        hash = (hash * 33) ^ str.charCodeAt(--i)
    return hash >>> 0;
}

exports. initLog=function(options) {
    if (!options) return ;
    log4jsConfigured={appenders:options, replaceConsole: false};
    log4js.configure(log4jsConfigured);
}

exports. getLogger=function(name) {
    var logger = log4js.getLogger(name||'normal');
    //logger.setLevel('INFO');
    return logger;
}

//((new Date()).getTime()/1000)>>>0

exports. result=function(value) {
    var value=value;
    value===undefined &&(value=true)
    return {"result":value};
}

exports. nowTime=function() {
    return ((new Date()).getTime()/1000)>>>0;
}

exports. freeCache=function(cacheObject) {
    Object.keys(cacheObject).forEach(function(key){
        var obj=cacheObject[key];
        if (obj.liveTime<exports.nowTime()){
            delete cacheObject[key]
        }
    })

    return ((new Date()).getTime()/1000)>>>0;
}

exports.easyRequest = function(url,fn,options) {
   var url=url.match(/^http:\/\/([^:\/]+)[:]?([0-9]*)(\S*)/i);
    var opt = {
        host: url[1],
        port: url[2]||80,
        path: url[3]
    };
    opt= util._extend(options||{},opt) ;
    opt.method= opt.method||'GET';
    var data=opt.data;
    data&& (delete opt.data);

    var req = http.request(opt, function (res) {
        var bufferHelper =new BufferHelper();
        if (res.statusCode !== 200){
            fn&& fn(new Error())
            return ;
        }
        res.on('data', function (chunk) {
            bufferHelper.concat(chunk);
        });
        res.on('end', function (e) {
            fn&&fn(null,bufferHelper.toBuffer().toString())
        });
    });
    req.on('error', function (e) {
        fn&&fn(e);
    });
    if (data&&opt.method==='POST'){
        if (typeof data==='object' &&  (!(data instanceof( Buffer)))){
            data=JSON.stringify(data);
        }
        req.write(data);
    }
    req.end();
}


exports.easyResponse = function(req,res,fn) {
    var bufferHelper =new BufferHelper();
    req.on('data',function(chunk){
        bufferHelper.concat(chunk);
    });
    req.on('end',function(){
        fn&&fn(null,bufferHelper.toBuffer())
    })
}

exports.easyResponseDecode = function(req,res,fn) {
    exports.easyResponse(req,res,function(err,data){
        fn && fn(err,decodeURI(data.toString()||''))
    });
}

exports.postFile = function(req,buff,fileInfo,postData,fn) {
    var max = 9007199254740992;
    var dec = Math.random() * max;
    var hex = dec.toString(36);
    var boundaryKey ='WebKitFormBoundary' +hex;
    var endData = '\r\n----' + boundaryKey + '--';
    var fileLength = 0, content;
    content = (function (obj) {
        var rslt = [];
        Object.keys(obj).forEach(function (key) {
            arr = ['\r\n----' + boundaryKey + '\r\n'];
            arr.push('Content-Disposition: form-data; name="' + key + '"\r\n\r\n');
            arr.push(obj[key]);
            rslt.push(arr.join(''));
        });
        return rslt.join('');
    })(postData);



}

exports.copy = function(src,dst) {
    var readable = fs.createReadStream(src);
    var writable = fs.createWriteStream( dst);
    readable.pipe( writable );
}

exports.injectedJs = function(js) {
    return  util.format(' <script type="text/javascript" src="%s"></script>',js);

}
