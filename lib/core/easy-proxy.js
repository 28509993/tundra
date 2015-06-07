/**
 * Created by Administrator on 2015/4/20.
 */

var http = require('http')
    ,util = require('util')
    , BufferHelper = require('bufferhelper')

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
}

exports=module.exports=function  (req,res,proxyUrl) {
    var proxyUrl=proxyUrl.match(/^http:\/\/([^:]+)[:]?([0-9]*)/i)
    var url=req.url||'/';
    url=url  .replace(/\/\//gi,'/')
    var outgoing={
        host: proxyUrl[1],
        port: proxyUrl[2]||80,
        path: req.url,
        method: req.method,
        //headers:{}
        headers:util._extend({}, req.headers)
    };
    //req.headers['content-type']&&(outgoing.headers['content-type']=req.headers['content-type']);
    //req.headers['accept']&&(outgoing.headers['accept']=req.headers['accept']);
    var proxyReq=http.request(outgoing );
    var ttout= setTimeout(function(){
        proxyReq.abort();
    } ,2000);
    proxyReq.on('socket', function(socket) {
        socket.on('connect', function() {
            clearTimeout(ttout);
        });
    });
    req.on('aborted', function () {
        proxyReq.abort();
    });
    req.on('error', proxyError);
    proxyReq.on('error', proxyError);
    function proxyError(e){
        console.log('proxyRes ---------errr!')
        writeError(res,e);
    }
    req.pipe(proxyReq);
    proxyReq.on('response', function(proxyRes) {
        Object.keys(proxyRes.headers).forEach(function(key) {
            res.setHeader(key, proxyRes.headers[key]);
        });
        res.writeHead(proxyRes.statusCode);
        proxyRes.on('end', function () {
        });
        proxyRes.pipe(res);
    });
}