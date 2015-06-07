/**
 * Created by Administrator on 2015/4/15.
 */
/**
 * Created by Administrator on 2015/4/10.
 */
//var urlRegex =  /(\w+):\/\/([^/:]+)(?::(\d*))?([^#]*)/; //for url


var
     http = require('http')
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
    ,easyProxy= require('../../lib/core/easy-proxy')
//,httpProxy = require('http-proxy')
  //  ,gbkDict= require('gbk-dict').init();
//,io = require('socket.io-client');
var bodyReg = /(<body[\s\S]+)(<[\s]*\/[\s]*body[\s]*>)/igm;
var redirectRegex = /^30(1|2|7|8)$/;
var isSSL = /^https|wss/;
var compressor={zip:{gzip:zlib.createGzip,deflate:zlib.createDeflate},
    unzip:{gzip:zlib.gunzip,deflate:zlib.inflate}};


exports=module.exports=function(options) {
    //var cacheSession={}
    var concurrentMax=3;
    var concurrentNum=0;
    var redirectMap={};
    var mainHtmls={};
    var blankRegs=[];
    var cacheContext = {};  //{'url':{buffer: ,headers:}}
    var cacheRegex = /(\/image\/|\.css$|\.js$)/i
    var ignoreRegex ;
    var charset='utf-8';
    options.target = extend( URL.parse(options.target,true),{xhost:(options.target.match(/^http[s]*:\/\/[^/]+/i))[0]});
    redirectMap=util._extend(redirectMap, options['redirectMap']);
    mainHtmls=util._extend(mainHtmls, options['mainHtmls']);
    blankRegs=blankRegs.concat(options['blankRegs']);
    cacheRegex=options['cacheRegex']||cacheRegex;
    ignoreRegex=options['ignoreRegex']
    concurrentMax=options['concurrentMax']||concurrentMax;
    charset=options['charset']||charset;
    loadOverHtml();
    function addRedirect(url, host) {
        redirectMap[url] || (redirectMap[url] = host);
    }

    function loadOverHtml() {
        Object.keys(mainHtmls).forEach(function (key) {
            var arrHtmls = mainHtmls[key];
            var arrHtmls= arrHtmls instanceof Array?arrHtmls:[arrHtmls];
            arrHtmls.forEach(function (mainHtml) {
                if (!mainHtml.overload) return;
                var filename=mainHtml.overload;
                delete mainHtml.overload;
                if ( !fs.existsSync(filename)) return ;
                fs.readFile(filename,'utf8',function(err,data){
                    if (err) return ;
                    mainHtml.overload = data;
                    /*
                    var injectedtxt=mainHtml.injected;
                    delete mainHtml.injected;
                    mainHtml.overload = data.replace(bodyReg, util.format("$1%s$2", injectedtxt || ''));*/
                });
            })
        });
    }


    //var fname='D:\\ecartoo\\tundra\\app\\!public\\myhtml.html';
    //html=fs.readFileSync(fname,'utf8');

    function url2location(location,xhost) {
        var location=location;
        var host=(location.match(/^http[s]*:\/\/[^/]+/i)||[])[0]||options.target.xhost;
        location=location.replace(/^http[s]*:\/\/[^/]+/i,xhost)
        if (host!==options.target.xhost && host!==xhost){
            location=util.format('%s%s%s%s',location,location.indexOf("?") == -1 ? "?" : "&",'xlocationx=',encodeURIComponent(host));
        }
        return location;
    }

    function location2url(location) {
        var location=location;
        var lreg= /(\?|&)xlocationx=([^&]+)([&]?)([\S]*$)/i
        var lMatchs=location.match(lreg);
        var host;
        if (lMatchs){
            //["?xlocationx=httpdldfd&a=111", "?", "httpdldfd", "&", "a=111"]
            host=decodeURIComponent(lMatchs[2]);
            location=location.replace(lreg,lMatchs[4]?lMatchs[1]+lMatchs[4]:'')
        }
        host=host||options.target.xhost;
        if (location.charAt(0)==='/'){
            location=host+location;
        }else{
            lreg=/^http:\/\/[^\/]+/i;
            location=location.replace(lreg,host);
        }
        return location;
    }

    function overloadUrl(req,data) {
        var html=data
        var isSameTarget=req.xtarget.xhost===options.target.xhost;
        if (req.mainHtml &&isSameTarget){
            blankRegs.forEach(function (blankReg) {
                html = html.replace(blankReg, "");
            });
        }
        var matchs;
        var originReg=/<[a-z]+[^<>]*\s+(href|src|action|background)\s*=\s*['"]?([^<>'"]+)[^>]*>/gim;
        var matchsList=[]
        while ((matchs = originReg.exec(html)) != null) {
            delete matchs.input
            matchsList.push(matchs)
        }
        var formMethonGetReg=/[\s]+method\s*=\s*("|')get("|')[\s]*/i;
        var formReg=/^<form/i
        var formInject=' <input type="hidden" name="xlocationx" value="xloca_data_tionx" >';

        matchsList.reverse().forEach(function(matchs) {
            var strurl = matchs[2];
            var url = URL.parse(strurl);
            if (!url.pathname) return;
            url.srcOrigin = matchs[0];
            if (req.xtarget.xhost !== options.target.xhost && !url.host) {
                extend(url, {protocol:req.xtarget.protocol,host:req.xtarget.host});
                url.pathname = URL.resolve(req.xtarget.pathname, url.pathname);
            }
            var strNewurl=URL.format(url);
            strNewurl=url2location(strNewurl,req.xhost);
            var formInjectlhost=''
            if (formReg.test(matchs[0])&&formMethonGetReg.test(url.srcOrigin)){
                var lhost= strNewurl.match(/xlocationx=([^&$]+)/i)
                if (lhost){
                    formInjectlhost=formInject.replace('xloca_data_tionx',decodeURIComponent(lhost[1]))
                }
            }
            strNewurl=strNewurl.replace(req.xhost,'')
            strNewurl=strNewurl.replace(options.target.xhost,'')
            url.srcOverload = url.srcOrigin.replace(strurl, strNewurl)+formInjectlhost;
            html = html.slice(0, matchs.index) + url.srcOverload + html.slice(matchs.index + url.srcOrigin.length);
            
        });


        /*

         var str1 = util.format('http[s]?://(%s[:0-9]*[/]?)', options.target.host);
         var originReg = new RegExp(str1 , 'igm');
         html =html.replace(originReg,'/');
         originReg=/<[^<|>]+\s+(href|src)\s*=\s*['|"]?(http[s]?[^<>'"]+)[^>]*>/gim;
         while ((matchs = originReg.exec(html)) != null) {
         var location=matchs[2];
         if (!location) continue;
         html=html.replace(location,url2location(location,req.xhost))
         }
         str1 = util.format('http[s]?://(%s[:0-9]*[/]?)', xhost.match(/[^/]+$/i)[0]);
         originReg = new RegExp(str1 , 'igm');
         html =html.replace(originReg,'/');*/
        //fs.writeFile( 'D:\\ecartoo\\tundra\\app\\zj\\origin\\abc.html',html,function(){})
        return html;
    }



    function zipStream(ziptype,data) {
        var raw = new Readable;
        raw.push(data);
        raw.push(null)
        var zipWorker=compressor.zip[ziptype];
        return !zipWorker?raw:raw.pipe(zipWorker());
    }

    function getZipType(xres) {
        var matchs
            , t
            , compressReg = /(gzip|deflate)/gi;
        while((matchs = compressReg.exec(xres.headers['content-encoding'])) !=null){
            t= matchs[1];
            break;
        }
        return t;
    }


    var passesOutgoing=[
        function checkValid(req, res, proxyRes) {
            var invalid=false;
            invalid=invalid||(proxyRes.headers['location']&&proxyRes.headers['allow']);
            invalid=invalid||(req.mainHtml&&req.mainHtml.must200 && proxyRes.statusCode !== 200);
            if (invalid)   {
                writeError(res);
                return true;
            }
        },
        function setChunked(req, res, proxyRes) {
            delete proxyRes.headers['content-length'];
            if (req.httpVersion === '1.0') {
                delete proxyRes.headers['transfer-encoding'];
            }else{
                proxyRes.headers['transfer-cncoding']= 'chunked';
            }
        },
        function setConnection(req, res, proxyRes) {
            if (req.httpVersion === '1.0') {
                proxyRes.headers.connection = req.headers.connection || 'close';
            } else if (!proxyRes.headers.connection) {
                proxyRes.headers.connection = req.headers.connection || 'keep-alive';
            }
        },
        function encodeLocation(req, res,proxyRes){
            var  location=proxyRes.headers['location'];
            if (!location||!redirectRegex.test(proxyRes.statusCode)) return ;
            proxyRes.headers['location']=url2location(location,req.xhost);
        },
        function cacheWeb(req, res, proxyRes) {
            if (req.mainHtml) return ;
            if (proxyRes.statusCode !== 200) {
                return;
            }
            if (!cacheRegex.test(req.url)) {
                return ;
            }
            if (!proxyRes.xBuffer||proxyRes.xBuffer.length<=0) return ;
            if (!proxyRes.headers['etag']){
                var nowstr=(new Date()) .toUTCString();
                var str = proxyRes.xBuffer.toString('base64')+'ni fuck u!ni mama!'+nowstr+(new Date()).getTime();
                str =crypto .createHash('md5') .update(str, 'utf8') .digest('hex');
                proxyRes.headers['etag']= '"' + str + '"'
                proxyRes.headers['last-modified']=nowstr;
            }
            cacheContext[req.url] = {buffer: proxyRes.xBuffer,
                headers: extend({}, proxyRes.headers)};
        },
        function writeHeaders(req, res, proxyRes) {
            Object.keys(proxyRes.headers).forEach(function(key) {
                res.setHeader(key, proxyRes.headers[key]);
            });

        },
        function overMainHtml(req, res, proxyRes) {
            var cttype = proxyRes.headers['content-type'];
            var isHtml = (/text\/html/i).test(cttype);
            if ((!req.mainHtml&&!isHtml)||proxyRes.xBuffer.length<=0) return;
            var mainHtml=req.mainHtml||{};
            var ziptype = getZipType(proxyRes);
            var unzipWorker = compressor['unzip'][ziptype];
            var dataCharset= getCharset(cttype);
            if (proxyRes.statusCode !== 200) {
                return;
            }
            var isSended=false;
            if (mainHtml.overload) {
                res.writeHead(proxyRes.statusCode);
                var html = mainHtml.overload;
                if (!req.xphantomx&&mainHtml.injected){
                    html = html.replace(bodyReg, util.format("$1%s$2", mainHtml.injected));
                }
                html = iconv.encode(html, dataCharset)
                zipStream(ziptype, html.slice(1)).pipe(res);
                isSended=true;
            }
            if (isSended&&!mainHtml.origin){
                return true;
            }
            ;!function(cb){
                unzipWorker ? unzipWorker(proxyRes.xBuffer, cb) : cb(null, proxyRes.xBuffer);
            }(function (err, decoded){
                if (err){
                    isSended||writeError(res);
                    return ;
                }
                var html=decoded;
                html = iconv.decode(html, dataCharset);
                //html=gbkDict.gbkToUTF8(html)
                html = ' ' + html;
                html = overloadUrl(req,html);
                if (mainHtml.origin) {
                    var originfile = mainHtml.origin;
                    delete mainHtml.origin;
                    fs.writeFile(originfile, html,{encoding:'utf-8'}, function (ee) {
                    })
                };
                if (!isSended){
                    if (!req.xphantom&&mainHtml.injected) {
                        res.writeHead(proxyRes.statusCode);
                        html = html.replace(bodyReg, util.format("$1%s$2", mainHtml.injected || ''));
                    }
                    html = iconv.encode(html, dataCharset)
                    zipStream(ziptype, html.slice(1)).pipe(res);
                    isSended=true;
                }
            });
            return true;
        },
        function writeDefault(req, res, proxyRes) {
            res.writeHead(proxyRes.statusCode);
            res.write(proxyRes.xBuffer);
            res.end();
            return true;
        }
    ];
    var webIncoming =[
        function overWritHead(req,res){
            var writeHead=res.writeHead;
            var doWriteHead=false;
            res.writeHead=function(){
                if (!doWriteHead){
                    /*
                    if (!req.xssidx){
                        setCookies(res,'xssidx');
                    }*/
                    writeHead.apply(this, arguments);
                }
                doWriteHead=true;
                res.writeHead.flag=true;
            }

        },
        function getCookies(req,res){
            /*
            var reg=/xssidx=([0-9]+)[;$]?/i;
            var cookies=req.headers['cookie']||'';
            var xssidx=cookies.match( reg)
            if (xssidx){
                req.xssidx=xssidx[1];
                req.headers['cookie']=cookies.replace(reg,'')
            }else{
                setCookies(res,'xssidx');
            }*/
        },
        function useNative(req,res){
            var funcExist;
            var matchs=req.url.match( /^\/([^\/\?]+)[\?]?[^\/]*$/i);
            if (matchs&&(funcExist=webNavtive[matchs[1].toUpperCase()])){
                funcExist(req,res)||writeError(res);
            }
            if (!funcExist){
                //check injected-
                var injectReg=/\/injected-[\S]*.js/i;
                if (injectReg.test(req.url)){
                    funcExist=true;
                    writeError(res,404);
                }
            }
            return funcExist&&true;
        },
        function setMainHtml(req,res) {
            var parsedUrl=req._parsedUrl;
            var mainHtml = mainHtmls[parsedUrl.pathname];
            if ( mainHtml instanceof Array){
                for (var i=0;i<mainHtml.length; i++){
                    var item=mainHtml[i];
                    if (item.match){
                        if (item.match.test( parsedUrl.search)){
                            mainHtml=item;
                        }
                    }
                }
            }

            req.mainHtml=mainHtml;
        },
        function decodeLocation(req,res){

            var reg=/(^http:\/\/[^\/]+)([\S]+$)/i;
            var url=location2url(req.url);
            var matchs=url.match(reg);
            req.url=matchs[2];
            var xhost=matchs[1];
            req.xtarget=extend( URL.parse( url,true),{xhost:xhost} );
            if (xhost!==options.target.xhost){
                req.xlocationx=xhost;
            }
            /*
            var xtarget;
            var xhost=options.target.xhost;
            if (!req.query.xlocationx) {
                xtarget= extend(URL.parse( xhost+req.url,true),{xhost:xhost});
            } else{
                req.url=req.url.replace( /[?|&]?xlocationx=[^&|$]+/i,'');
                xhost=(req.query.xlocationx.match(/^http[s]*:\/\/[^/]+/i)||[])[0]||xhost;
                delete req.query.xlocationx;
                if (xhost!==options.target.xhost){
                    req.xlocationx=xhost;
                }
                xtarget= extend(URL.parse( xhost+req.url,true),{xhost:xhost});
                req._parsedUrl= URL.parse( req.url,true);
                req.query=req._parsedUrl.query;
            }
            req.xtarget=xtarget;
*/
            //console.log(req.xtarget);
        },
        function saveTrace(req, res) {
            var proto=getProto(req);
            var xhost=util.format('%s://%s',proto,req.headers['host']);
            req.xhost =xhost;
        },
        function clearTrace(req, res) {
            if ((req.method === 'DELETE' || req.method === 'OPTIONS')
                && !req.headers['content-length']) {
                req.headers['content-length'] = '0';
            }
            delete req.headers['host'];
            //delete req.headers['referer'];
            var str;
            if (str=req.headers['referer']){
                req.headers['referer'] = location2url(str);
            }
            if (req.headers['origin']){
                req.headers['origin'] = req.xtarget.xhost;
            }

            if (req.headers['x-phantom-x']){
                req.xphantomx=req.headers['x-phantom-x'] ;
                delete req.headers['x-phantom-x'] ;
            }

        },
        function setReferer(req, res) {
            if (!req.mainHtml) return ;
            if ( req.mainHtml.referer){
                req.headers['referer']=req.mainHtml.referer
            }
            if (req.mainHtml.origin){
                req.headers['origin']=req.mainHtml.origin
            }
        },
        function timeout(req, res) {
            if (options.timeout) {
                req.socket.setTimeout(options.timeout);
            }
        },
        function fastResponse(req,res) {
            if (req.mainHtml) return ;
            if (req.xlocationx) return ;
            if (ignoreRegex && ignoreRegex.test(req.url)) {
                res.end();
                return true;

            }
            var xcache = cacheContext[req.url];
            if (!xcache) {
                delete req.headers['if-none-match'];
                delete req.headers['if-modified-since'];
                return ;
            };
            var headers=extend({},xcache.headers);
            if (req.httpVersion === '1.0') {
                delete headers['transfer-encoding'];
            }else{
                headers['transfer-cncoding']= 'chunked';
            }
            Object.keys(headers).forEach(function (key) {
                res.setHeader(key, headers[key]);
            });
            if (req.headers['if-none-match'] &&req.headers['if-none-match'] === xcache.headers['etag']) {
                res.writeHead(304);
            } else {
                res.writeHead(200);
                res.write(xcache.buffer);
            }
            reqEmitter>0&&reqEmitter.emit('try');
            res.end();
            return true;
        },
        function proxyRequest(req, res) {
            console.log(req.url)
            var outgoing =setupOutgoing(options.ssl || {},req);
            var proxyReq = (req.xtarget.protocol === 'https:' ? https : http).request(outgoing );
            var ttout= setTimeout(function(){
                proxyReq.abort();
            } ,2000);
            concurrentNum++;
            proxyReq.on('socket', function(socket) {
                // Enable developers to modify the proxyReq before headers are sent
                socket.on('connect', function() {
                    clearTimeout(ttout);
                });
                socket.on('error', function() {
                    console.log('error . .error . .error . .')
                });
                socket.on('close', function() {
                    //defer(function(){
                    concurrentNum--;
                    concurrentMax>0&&reqEmitter.emit('try')
                    //})
                });
                proxyBefore(req,res,proxyReq,undefined);
            });
            options.timeout&& proxyReq.setTimeout(options.timeout, function() {
                proxyReq.abort();
            });
            req.on('aborted', function () {
                proxyReq.abort();
            });
            req.on('error', proxyError);
            proxyReq.on('error', proxyError);

            var isSend=false;
            function proxyError(e){
                isSend=true;
                writeError(res,e)
            }
            req.pipe(proxyReq);
            proxyReq.on('response', function(proxyRes) {
                proxyBeginning(req,res,proxyReq,proxyRes);
                var bufferHelper =new BufferHelper();
                proxyRes.on('data', function (chunk) {
                    bufferHelper.concat(chunk);

                });
                proxyRes.on('end', function (e) {
                    if (isSend) return ;
                    proxyEnding(req,res,proxyReq,proxyRes);
                    proxyRes.xBuffer=bufferHelper.toBuffer();
                    bufferHelper=null;
                    for(var i=0; i < passesOutgoing.length; i++) {
                        if(passesOutgoing[i].call(null,req, res, proxyRes)) {
                            break;
                        }
                    }
                });
            });
        }
    ];
    var webNavtive={};
    [
        /*
        function writeXCache(req,res){
            if (!req.xssidx) return ;
            var bufferHelper=new BufferHelper();
            req.on('data',function(chunk){
                bufferHelper.concat(chunk);
            })
            req.on('end',function(err){
                if (err) return writeError(res);
                res.writeHead(200);
                cacheSession[req.xssidx+'']={data:bufferHelper.toBuffer(),time:((new Date()).getTime()/1000)>>>0}
                res.end();
            })
            return true;
        },
        function readXCache(req,res){
            if (!req.xssidx) return ;
            var data= cacheSession[req.xssidx];
            data= data? data.data.toString():'';
            res.end(data);
            return true;
        },
        function postXIic(req,res){
            var proxyUrl=options['iicware'];
            easyProxy(req,res,proxyUrl);
            return true;
        },
        function getImgValue(req,res){
            var proxyUrl=options['midware'];
            easyProxy(req,res,proxyUrl);
            return true;
        },
        function returnXTask(req,res){
            var proxyUrl=options['bizware'];
            easyProxy(req,res,proxyUrl);
            return true;
        }*/
            //"midware":  {"postiic":"http://localhost:99991","getiic":"http://localhost:99991"},
    ].forEach(function(func) {
            webNavtive[func.name.toUpperCase()] = func;
        });

    function setupOutgoing(outgoing,req){
        var target=req.xtarget
        outgoing.port = target.port ||
            (isSSL.test(target.protocol) ? 443 : 80);
        ['host', 'hostname', 'socketPath', 'pfx', 'key',
            'passphrase', 'cert', 'ca', 'ciphers', 'secureProtocol'].forEach(
            function(e) { outgoing[e]=target[e]; }
        );

        outgoing.method = req.method;
        outgoing.headers = extend({}, req.headers);
        options.headers&& extend(outgoing.headers, options.headers);
        options.auth&&(outgoing.auth = options.auth);

        if (isSSL.test(target.protocol)) {
            outgoing.rejectUnauthorized = (typeof options.secure === "undefined") ? true : options.secure;
        }

        outgoing.agent = options.agent || false;
        outgoing.localAddress = options.localAddress;
        if (!outgoing.agent) {
            outgoing.headers = outgoing.headers || {};
            var upgradeHeader = /(^|,)\s*upgrade\s*($|,)/i;
            if (typeof outgoing.headers.connection !== 'string'
                || !upgradeHeader.test(outgoing.headers.connection)
                ) { outgoing.headers.connection = 'close'; }
        }
        outgoing.path = target.path||'/'
        outgoing.path =outgoing.path  .replace(/\/\//gi,'/')
        return outgoing;
    }


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

    function proxyBefore(req,res,proxyReq,_){
        //console.log(mainHtml);
    }
    function proxyBeginning(req,res,proxyReq,proxyRes){
        //console.log('---------------proxyBeginning----------');
    }
    function proxyEnding(req,res,proxyReq,proxyRes){
        //console.log('---------------proxyEnding----------');
    }
    function proxyAfter(req,res,proxyReq){

    }
    function hashCode(str){
        var hash = 5381,
            i    = str.length
        while(i)
            hash = (hash * 33) ^ str.charCodeAt(--i)
        return hash >>> 0;
    }

    function setCookies(res,key,value){
        if (!key) return ;
        var str=value;
        if (!str){
            str='1'+(new Date()).getTime()+ Math.random();
            str= hashCode(str)+'' ;
        }
        str=util.format('%s=%s; Path=/',key,str);
        var header = res.getHeader('set-cookie') || [];
        header=Array.isArray(header)?header:[header];
        header =header. concat(str);
        res.setHeader('set-cookie', header);
    }

    function getPort (req) {
        var res = req.headers.host ? req.headers.host.match(/:(\d+)/) : '';
        return res ?
            res[1] :
            req.connection.pair ? '443' : '80';
    };
    function getProto (req) {
        var encrypted = req.isSpdy || req.connection.encrypted || req.connection.pair;
        return encrypted ? 'https' : 'http'
    };

    function getCharset (cttype) {
        var chs = cttype.match (/(gbk|gb2312|utf-8)/i);
        chs=chs?chs[0]:charset;
        (/gb2312/i).test(chs)&&(chs='GBK')
        return chs;
    };
    var defer = typeof setImmediate === 'function'
        ? setImmediate
        : function(fn){ process.nextTick(fn.bind.apply(fn, arguments)) }
    var EventEmitter = require('events').EventEmitter;
    var reqTasks=[];
    var reqEmitter= new EventEmitter();
    reqEmitter.on('req',function(task){
        reqTasks.splice(0,0,task);
        if (concurrentNum==0){
            reqEmitter.emit('try')
        }else{
            //defer(function(){
            if (concurrentNum<concurrentMax){
                reqEmitter.emit('try')
            }
            //})
        }

    });
    reqEmitter.on('try',function(){
        var task=reqTasks.pop();
        if (!task||concurrentNum>=concurrentMax) return ;
        mainRequest.call(null,task.req, task.res,task.mainHtml);
    });

    function mainRequest(req, res){
        for(var i=0; i < webIncoming.length; i++) {
            if(webIncoming[i].call(null,req, res)) {
                break;
            }

        }
    }

    /*
    function freeXCache(){
        Object.keys(cacheSession).forEach(function (key) {
            var sess=cacheSession[key];
            var tt=((new Date()).getTime()/1000)>>>0;
            if (tt-sess.time>600){
                delete cacheSession[key];
            }
        });
    }
    ;!function timeTask(){
        setInterval(function(){
            //freeXCache();
        },10000)
    }()*/

    //for test;
    concurrentMax=4;
    var ddlz=0
    var mddlz=10000
    //<form id="formcar" method="get" action="http://wzcx.66wz.com:8000/search/jsp/base/carSearch.jsp"><table width="96%" border="0" cellspacing="5" cellpadding="0">
//require('http-proxy').createProxyServer({target:'http://www.bjjtgl.gov.cn/'}).listen(10010);
    return  function (req, res,next) {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
        res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
        ddlz++;
        if (ddlz>mddlz){
            defer(function(){process.exit(0)});
            return ;
        }
        if (concurrentMax>0){
            reqEmitter.emit('req',{req:req, res:res});
        }else{
            mainRequest.call(null,req, res);
        }
    };

}

exports.getInjectedHtml=function(){
    return '';
    /*
    return '<script type="text/javascript" src="/socket.io.js"></script>'
        +'<script type="text/javascript" src="/injected-public.js"></script> '
        + '<div><input id="injectedManualmode-btn" type="button" value="手动操作" /> </div>'
        + '<div><input id="injected-result" type="text"  /> </div>'
        + '<div><input id="injected-flag" type="text"  /> </div>'
        + '<div><input id="injected-data" type="text"  /> </div>'*/
}
/*
 http://www.itzhai.com/nodejs-study-notes-introduction-to.html#Meteor
 * http.request(options, callback)
 Options:
 host: A domain name or IP address of the server to issue the request to. Defaults to 'localhost'.
 hostname: To support url.parse() hostname is preferred over host
 port: Port of remote server. Defaults to 80.
 localAddress: Local interface to bind for network connections.
 socketPath: Unix Domain Socket (use one of host:port or socketPath)
 method: A string specifying the HTTP request method. Defaults to 'GET'.
 path: Request path. Defaults to '/'. Should include query string if any. E.G. '/index.html?page=12'
 headers: An object containing request headers.
 auth: Basic authentication i.e. 'user:password' to compute an Authorization header.
 agent: Controls Agent behavior. When an Agent is used request will default to Connection: keep-alive.

 Class: http.ServerResponse
 Event: 'close'
 response.writeContinue()
 response.writeHead(statusCode, [reasonPhrase], [headers])
 response.setTimeout(msecs, callback)
 response.statusCode response.setHeader(name, value)
 response.headersSent response.sendDate response.getHeader(name)
 response.removeHeader(name)
 response.write(chunk, [encoding])
 response.addTrailers(headers)
 response.end([data], [encoding])
 *
 * */