/**
 * Created by Administrator on 2015/4/15.
 */
/**
 * Created by Administrator on 2015/4/10.
 */
//var urlRegex =  /(\w+):\/\/([^/:]+)(?::(\d*))?([^#]*)/; //for url

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
//,io = require('socket.io-client');
var bodyReg = /(<body[\s\S]+)(<[\s]*\/[\s]*body[\s]*>)/igm;
var redirectRegex = /^30(1|2|7|8)$/;
var isSSL = /^https|wss/;
var compressor={zip:{gzip:zlib.createGzip,deflate:zlib.createDeflate},
    unzip:{gzip:zlib.gunzip,deflate:zlib.inflate}};


exports=module.exports=function(options) {
    var concurrentMax=3;
    var concurrentNum=0;
    var proxyopt ={};
    var redirectMap={};
    var mainHtmls={};
    var blankRegs=[];
    var cacheContext = {};  //{'url':{buffer: ,headers:}}
    var cacheRegex = /(\/image\/|\.css$|\.js$)/i
    var ignoreRegex ;
    options.target =  URL.parse(options.target,true);
    proxyopt=util._extend(proxyopt, options['proxyopt']);
    redirectMap=util._extend(redirectMap, options['redirectMap']);
    mainHtmls=util._extend(mainHtmls, options['mainHtmls']);
    blankRegs=blankRegs.concat(options['blankRegs']);
    cacheRegex=options['cacheRegex']||cacheRegex;
    ignoreRegex=options['ignoreRegex']
    concurrentMax=options['concurrentMax']||concurrentMax;
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
                    var injectedtxt=mainHtml.injected;
                    delete mainHtml.injected;
                    mainHtml.overload = data.replace(bodyReg, util.format("$1%s$2", injectedtxt || ''));
                });
            })
        });
    }

    function getMainHtml(req) {
        var parsedUrl=req._parsedUrl;
        if (req.query.xlocationx){
            var str=decodeURIComponent(req.query.xlocationx);
            parsedUrl=URL.parse(req.query.xlocationx,true);
        }

        var mainHtml = mainHtmls[parsedUrl.pathname];
        if (!( mainHtml instanceof Array)){
            return mainHtml;
        }
        for (var i=0;i<mainHtml.length; i++){
            var item=mainHtml[i];
            if (item.match){
                if (item.match.test( parsedUrl.query)){
                    return item;
                }
            }
        }
    }

    function overloadUrl(data) {
        var str1 = util.format('http://(%s[:0-9]*)', proxyopt.host);
        var str2 = '([^"|?|\']+)';
        var originReg = new RegExp(str1 + str2, 'igm');
        var matchs;
        while ((matchs = originReg.exec(data)) != null) {
            addRedirect(matchs[2], matchs[1])
        }
        str1 = util.format('http://%s[:0-9]*', proxyopt.host);
        originReg = new RegExp(str1, 'igm');
        var str = data.replace(originReg, "");
        blankRegs.forEach(function (blankReg) {
            str = str.replace(blankReg, "");
        });
        return str;
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


    function addLocationRedirect(req, res, proxyRes) {
        var location = proxyRes.headers['location'];
        if (!location || !redirectRegex.test(proxyRes.statusCode)) {
            return;
        }
        var u = URL.parse(location,true);
        if (!mainHtmls[u.pathname]) {
            addRedirect(u.pathname, u.host)
        }
        u.host = req.headers['host'];
        proxyRes.headers['location'] = u.format();
    }

    function webProxy(xopts, req, res, cb) {
        var xopt = {path: req.url, method: req.method, headers: util._extend({}, req.headers)};
        xopt = util._extend(xopt, xopts || {});
        delete xopt.headers['referer'];
        xopt.headers['host']=URL.parse(req.url).host;
        var proxyReq = http.request(xopt);
        proxyReq.on('socket', function(socket) {


        });

        req.pipe(proxyReq);
        proxyReq.on('response', function (xres) {
            var mainHtml = getMainHtml(req);
            if ((mainHtml&&mainHtml.must200 && xres.statusCode !== 200)||(xres.headers['location']&&xres.headers['allow'])) {
                console.log(req.url + '............ error!')
                res.writeHead(404);
                res.end();
                return;
            }

            if (req.httpVersion === '1.0') {
                delete xres.headers['transfer-encoding'];
                xres.headers.connection = req.headers.connection || 'close';
            }else{
                xres.headers.connection = req.headers.connection || 'keep-alive';
            }

            redirectRegex.test(xres.statusCode) && addLocationRedirect(req, res, xres);
            Object.keys(xres.headers).forEach(function (key) {
                res.setHeader(key, xres.headers[key]);
            });
            //res.writeHead(xres.statusCode);
            var bufferHelper = new BufferHelper();
            xres.on('data', function (chunk) {
                bufferHelper.concat(chunk);
            });
            xres.on('end', function (err) {
                cb && cb(err, xres, bufferHelper);
            });
        });

    }

    function mainProxy(req, res) {
        var mainHtml = getMainHtml(req);
        if (!mainHtml) return next();
        webProxy(proxyopt, req, res, function (err, xres, bufferHelper) {
            //res.write(bufferHelper.toBuffer());
            //return res.end();
            var isGbk = false;
            var ziptype=getZipType(xres);
            var unzipWorker=compressor['unzip'][ziptype];
            var cttype = xres.headers['content-type'] || xres.headers['Content-Type'];
            isGbk = (/gbk/i).test(cttype);
            //console.log(xres.headers);
            var direct = true;
            delete res._headers['content-length'];
            res.setHeader('transfer-cncoding', 'chunked');
            res.writeHead(xres.statusCode);
            if (xres.statusCode === 200) {
                if (mainHtml.origin) {
                    var originfile = mainHtml.origin;
                    delete mainHtml.origin;
                    ;!function (buffer,cb){
                        unzipWorker?unzipWorker(buffer,cb):cb(null,buffer);
                    }(bufferHelper.toBuffer(), function (err, decoded) {
                        var str = decoded;
                        isGbk && (str = iconv.decode(str, "GBK"));//GBK
                        str = ' ' + str;
                        str = overloadUrl(str);
                        fs.writeFile(originfile, str, function () {
                        })
                    });
                }

                if (mainHtml.overload) {
                    var str = mainHtml.overload;
                    isGbk && (str = iconv.encode(str, "GBK"));
                    zipStream(ziptype,str.slice(1)).pipe(res);
                    direct = false;
                } else if (mainHtml.injected) {
                    ;!function (buffer,cb){
                        unzipWorker?unzipWorker(buffer,cb):cb(null,buffer);
                    }( bufferHelper.toBuffer(),function (err, decoded) {

                        var str = decoded;
                        isGbk && (str = iconv.decode(str, "GBK"));//GBK
                        str = ' ' + str;
                        str = overloadUrl(str);
                        str = str.replace(bodyReg, util.format("$1%s$2", mainHtml.injected || ''));
                        //console.log(str);
                        isGbk && (str = iconv.encode(str, "GBK"))
                        zipStream(ziptype,str.slice(1)).pipe(res);
                    });
                    direct = false;
                }
            }
            if (direct) {
                res.write(bufferHelper.toBuffer());
                res.end();
            }
        })
    }



    function autoRedirectProxy(req, res, next) {
        var host = redirectMap[req._parsedUrl.pathname];
        if (!host) return next();
        var proxyRedirct = httpProxy.createProxyServer({target: 'http://' + host});
        proxyRedirct.on('error', function (err) {
            console.log(err);
        });
        proxyRedirct.web(req, res);
    }

    function otherProxy(req, res, next) {
        var reg=ignoreRegex?new RegExp(ignoreRegex.source,'igm'):undefined;
        if (reg&&reg.test(req.url)) {
            return res.end();
        }
        var xcache = cacheContext[req.url];
        if (xcache) {
            Object.keys(xcache.headers).forEach(function (key) {
                res.setHeader(key, xcache.headers[key]);
            });
            if (req.headers['if-none-match'] === xcache.headers['etag']) {
                res.writeHead(304);
            } else {
                res.writeHead(200);
                res.write(xcache.buffer);
            }
            res.end();
            return;
        }
        webProxy(proxyopt, req, res, function (err, xres, bufferHelper) {
            var reg=new RegExp(cacheRegex.source,'igm');
            if (reg.test(req.url)) {
                cacheContext[req.url] = {buffer: bufferHelper.toBuffer(),
                    headers: util._extend({}, xres.headers)};
            }
            res.writeHead(xres.statusCode);
            res.write(bufferHelper.toBuffer());
            res.end();
        })
    }

    var passesOutgoing=[
        function checkValid(req, res, proxyRes,mainHtml) {
            var invalid=false;
            invalid=invalid||proxyRes.headers['location']&&proxyRes.headers['allow'];
            invalid =invalid|| mainHtml&&mainHtml.must200 && proxyRes.statusCode !== 200
            if (!invalid) return ;
            res.writeHead(500);
            return res.end();
        },
        function setChunked(req, res, proxyRes,mainHtml) {
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
        /*http://www.zjsgat.gov.cn:9087/ids/LoginServlet?coAppName=empnYXR3YXMzNQ==&coSessionId=RTFFMEU0QTYxQTBCOEU0QUY5OTUyN0M3RDM2QzNEQ0U=&surl=aHR0cDovL3d3dy56anNnYXQuZ292LmNuOjgwODAvd2FzL3BvcnRhbHMvY2FyX2xsbGVnYWxfcXVlcnkuanNw
         localhost:19571/ids/LoginServlet?coAppName=empnYXR3YXMzNQ==&coSessionId=RTFFMEU0QTYxQTBCOEU0QUY5OTUyN0M3RDM2QzNEQ0U=&surl=aHR0cDovL3d3dy56anNnYXQuZ292LmNuOjgwODAvd2FzL3BvcnRhbHMvY2FyX2xsbGVnYWxfcXVlcnkuanNw&xlocationx=http%3A%2F%2Fwww.zjsgat.gov.cn%3A9087%2Fids%2FLoginServlet%3FcoAppName%3DempnYXR3YXMzNQ%3D%3D%26coSessionId%3DRTFFMEU0QTYxQTBCOEU0QUY5OTUyN0M3RDM2QzNEQ0U%3D%26surl%3DaHR0cDovL3d3dy56anNnYXQuZ292LmNuOjgwODAvd2FzL3BvcnRhbHMvY2FyX2xsbGVnYWxfcXVlcnkuanNw
         */
        function encodeLocation(req, res,proxyRes){
            var  location=proxyRes.headers['location'];
            if (!location||!redirectRegex.test(proxyRes.statusCode)) return ;
            var reg =  /(\w+:\/\/[^/]+)/;
            //var qs=util.format('%s%s%s',location.indexOf("?") == -1 ? "?" : "&",'xlocationx=',encodeURIComponent(location));
            //qs=location.replace(reg, req.xhost||'/')+qs;
            var qs=util.format('http://%s/xlxocationx?%s%s',req.xhost,'xlocationx=',encodeURIComponent(location));
            proxyRes.headers['location']=qs;
        },
        function cacheWeb(req, res, proxyRes,mainHtml) {
            if (mainHtml) return ;
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
        function writeHeaders(req, res, proxyRes,mainHtml) {
            Object.keys(proxyRes.headers).forEach(function(key) {
                res.setHeader(key, proxyRes.headers[key]);
            });
        },
        function overMainHtml(req, res, proxyRes,mainHtml) {
            if (!mainHtml) return
            var isGbk = false;
            var ziptype = getZipType(proxyRes);
            var unzipWorker = compressor['unzip'][ziptype];
            var cttype = proxyRes.headers['content-type'];
            isGbk = (/gbk/i).test(cttype);
            if (proxyRes.statusCode !== 200) {
                return;
            }
            var isSended=false;
            if (mainHtml.overload) {
                res.writeHead(proxyRes.statusCode);
                var html = mainHtml.overload;

                isGbk && (html = iconv.encode(html, "GBK"));
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
                    return isSended||( res.writeHead(500),  res.end())
                }
                var html=decoded;
                isGbk && (html = iconv.decode(html, "GBK"));
                var urlRegex = /<[^>]+(http[s:\s]+[^'|"]+)[^<]+>/gi
                html = ' ' + html;
                html = overloadUrl(html);
                if (mainHtml.origin) {
                    var originfile = mainHtml.origin;
                    delete mainHtml.origin;
                    fs.writeFile(originfile, str, function () {
                    })

                };
                if (!isSended){
                    if (mainHtml.injected) {
                        res.writeHead(proxyRes.statusCode);
                        html = html.replace(bodyReg, util.format("$1%s$2", mainHtml.injected || ''));
                        isGbk && (html = iconv.encode(html, "GBK"));
                        zipStream(ziptype, html.slice(1)).pipe(res);
                        isSended=true;
                    }else{
                        res.writeHead(proxyRes.statusCode);
                        res.write(proxyRes.xBuffer);
                        res.end();
                    }
                }


            });
            return true;

            res.writeHead(proxyRes.statusCode);
            if (mainHtml.origin) {
                var originfile = mainHtml.origin;
                delete mainHtml.origin;
                ;!function (buffer, cb) {
                    unzipWorker ? unzipWorker(buffer, cb) : cb(null, buffer);
                }(bufferHelper.toBuffer(), function (err, decoded) {
                    var str = decoded;
                    isGbk && (str = iconv.decode(str, "GBK"));//GBK
                    str = ' ' + str;
                    str = overloadUrl(str);
                    fs.writeFile(originfile, str, function () {
                    })
                });
            }
            if (mainHtml.overload) {
                var str = mainHtml.overload;
                isGbk && (str = iconv.encode(str, "GBK"));
                zipStream(ziptype, str.slice(1)).pipe(res);
            } else if (mainHtml.injected) {
                ;!function (buffer, cb) {
                    unzipWorker ? unzipWorker(buffer, cb) : cb(null, buffer);
                }(bufferHelper.toBuffer(), function (err, decoded) {
                    var str = decoded;
                    isGbk && (str = iconv.decode(str, "GBK"));//GBK
                    str = ' ' + str;
                    str = overloadUrl(str);
                    var reg = new RegExp(bodyReg.source, 'igm');
                    str = str.replace(reg, util.format("$1%s$2", mainHtml.injected || ''));
                    //console.log(str);
                    isGbk && (str = iconv.encode(str, "GBK"))
                    zipStream(ziptype, str.slice(1)).pipe(res);
                });
            }

        },
        function writeDefault(req, res, proxyRes) {
            res.writeHead(proxyRes.statusCode);
            res.write(proxyRes.xBuffer);
            res.end();
        }
    ];
    var webIncoming =[

        function saveTrace(req, res,mainHtml) {
            req.xhost =req.headers['host'];
        },
        function clearTrace(req, res,mainHtml) {
            if ((req.method === 'DELETE' || req.method === 'OPTIONS')
                && !req.headers['content-length']) {
                req.headers['content-length'] = '0';
            }
            delete req.headers['host'];
        },
        function setReferer(req, res,mainHtml) {
            delete req.headers['referer'];
            if (mainHtml&&mainHtml.referer) {
                req.headers['referer']=mainHtml.referer;
            }
        },
        function timeout(req, res,mainHtml) {
            if (options.timeout) {
                req.socket.setTimeout(options.timeout);
            }
        },
        function decodeLocation(req,res,mainHtml){

            if (!req.query.xlocationx) return ;
            var location=decodeURIComponent(req.query.xlocationx);
            var urlpar=URL.parse(location,true);
            urlpar.url=urlpar.path;
            req.url =urlpar.path;
            req.xlocationx=urlpar;
        },
        function fastResponse(req,res,mainHtml) {
            if (mainHtml) return ;
            if (req.xlocationx) return ;
            if (ignoreRegex && ignoreRegex.test(req.url)) {
                return res.end();
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
            return res.end();
        },
        /*
         * http://localhost:10580/zzwfcl/vio.do?act=veh_vio_query&xlocationx=http%3A%2F%2Fwww.zjsgat.gov.cn%3A8080%2Fwas%2Fportals%2Fcar_lllegal_query.jsp&agMode=1&com.trs.idm.gSessionId=A1ED50B21B9A8E18FA16C214090B7609.39
         http://localhost:10580/zzwfcl/vio.do?act=veh_vio_query&xlocationx=http%253A%252F%252F192.168.0.3%253A10580%252Fzzwfcl%252Fvio.do%253Fact%253Dveh_vio_query

         * */

        function proxyRequest(req, res,mainHtml) {

            var target= req.xlocationx||(extend({},options.target)) ;
            req.xlocationx||(target.path=req.url);

            var outgoing =setupOutgoing(options.ssl || {},target,req);
            console.log(outgoing.host+''+req.path)
            var proxyReq = (target.protocol === 'https:' ? https : http).request(outgoing );
            var ttout= setTimeout(function(){
                proxyReq.abort();
            } ,1000);
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
                proxyBefore(req,res,proxyReq,undefined,mainHtml);
            });
            options.timeout&& proxyReq.setTimeout(options.timeout, function() {
                proxyReq.abort();
            });

            req.on('aborted', function () {
                proxyReq.abort();
            });
            req.on('error', proxyError);
            proxyReq.on('error', proxyError);
            var writeHead=res.writeHead;
            var doWriteHead=false;
            function proxyError(e){
                console.log('dddddddddddd')
                res.writeHead(500);
                res.end()
            }
            res.writeHead=function(){
                doWriteHead||writeHead.apply(this, arguments);
                doWriteHead=true;
            }

            req.pipe(proxyReq);
            proxyReq.on('response', function(proxyRes) {
                console.log(proxyRes.statusCode+req.url)
                console.log('---------------------')
                console.log(proxyRes.headers);
                console.log('---------------------')
                proxyBeginning(req,res,proxyReq,proxyRes,mainHtml);
                var bufferHelper =new BufferHelper();
                proxyRes.on('data', function (chunk) {
                    bufferHelper.concat(chunk);

                });
                proxyRes.on('end', function () {
                    proxyEnding(req,res,proxyReq,proxyRes,mainHtml);
                    proxyRes.xBuffer=bufferHelper.toBuffer();
                    for(var i=0; i < passesOutgoing.length; i++) {
                        if(passesOutgoing[i].call(null,req, res, proxyRes,mainHtml)) {
                            break;
                        }
                    }
                });

                // proxyRes.pipe(res);
            });

            // console.log(mainHtml);

            return  true;
            var host = redirectMap[req._parsedUrl.pathname];
            var router = otherProxy;
            if (mainHtml) {
                router = mainProxy;
            } else if (host) {
                router = autoRedirectProxy;
            }
            router.call(null, req, res,mainHtml)
        }
    ];

    function setupOutgoing(outgoing,target,req){
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
        return outgoing;
    }
    function decodeLocation(url){
        if (!req.query.xlocationx) return ;
        var location=decodeURIComponent(req.query.xlocationx);
        var urlpar=URL.parse(location,true);
        urlpar.url=urlpar.path;

        req.xlocationx=urlpar;
    }

    function proxyBefore(req,res,proxyReq,_,mainHtml){
        //console.log(mainHtml);
    }
    function proxyBeginning(req,res,proxyReq,proxyRes,mainHtml){
        //console.log('---------------proxyBeginning----------');
    }
    function proxyEnding(req,res,proxyReq,proxyRes,mainHtml){
        //console.log('---------------proxyEnding----------');
    }
    function proxyAfter(req,res,proxyReq,mainHtml){

    }

    function getPort (req) {
        var res = req.headers.host ? req.headers.host.match(/:(\d+)/) : '';
        return res ?
            res[1] :
            req.connection.pair ? '443' : '80';
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

    function mainRequest(req, res,mainHtml){
        for(var i=0; i < webIncoming.length; i++) {
            if(webIncoming[i].call(null,req, res,mainHtml)) {
                break;
            }
        }
    }
    concurrentMax=0;
    var ddlz=0
    return  function (req, res,next) {

        ddlz++;
        if (ddlz>1){
            defer(function(){process.exit(0)});
            return ;
        }

        console.log(ddlz+'--in----'+req.url)
        var mainHtml = getMainHtml(req);
        if (concurrentMax>0){
            reqEmitter.emit('req',{req:req, res:res,mainHtml:mainHtml});
        }else{
            mainRequest.call(null,req, res,mainHtml);
        }

        /*
         var mainHtml = mainHtmls[req._parsedUrl.pathname]
         var host = redirectMap[req._parsedUrl.pathname];
         var router = otherProxy;
         if (mainHtml) {
         router = mainProxy;
         } else if (host) {
         router = autoRedirectProxy;
         }
         router.call(null, req, res, next)*/
    };


    /*
     return  function (req, res, next) {
     var mainHtml = getMainHtml(req);
     var host = redirectMap[req._parsedUrl.pathname];
     var router = otherProxy;
     if (mainHtml) {
     router = mainProxy;
     } else if (host) {
     router = autoRedirectProxy;
     }
     router.call(null, req, res)
     }

     function encodeLocation(xres,newtarget){
     var  location=xres.headers['location'];
     if (!location) return ;
     var reg =  /(\w+:\/\/[^/]+)/;
     var qs=util.format('%s%s%s',location.indexOf("?") == -1 ? "?" : "&",'xlocationx=',encodeURIComponent(location));
     qs=location.replace(reg, newtarget||'')+qs;
     xres.headers['location']=qs;
     }
     */




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