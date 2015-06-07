/**
 * Created by Administrator on 2015/4/28.
 */
var webpage = require('webpage');
var system = require('system');
var fs = require('fs');
//var exp={}
//var fs = require('fs');

var jsExtPath='/public';
var jqueryfile='/injected-jquery.js'

/*
function EventEmitter(){
    this._events = {};
}
EventEmitter.prototype.emit = function(type) {
    if (!this._events) return ;
    var listeners =this._events[type];
    if (!listeners||listeners.length<=0) return ;
    for (var i = 0,n=listeners.length; i < n; i++) {
        listeners[i].apply(this, arguments);
    }
}

EventEmitter.prototype.on = function(type, listener) {
    if (!type||typeof listener !== 'function') return ;
    var evts;
    ( evts=this._events[type])||(evts=this._events[type]=[]);
    evts.push(listener)
};*/

;[
    //var options1={method:'get',headers:{},dataType:'json',data:''}
    function objectType (obj){
        var str= Object.prototype.toString.call(obj).toLowerCase();
        str=str.match(/\[object\s([a-z]+)\]/)
        return str[1];

    },
    function _extend(a,b){
        if (!a||!b) return a;
        for(var i in b){
            a[i]=b[i];
        }
        return a;
    },
    function basePath(ctor, superCtor) {
        return system.args[0].match(/([\s\S]+)phantom/i)[1];
    },
    function resolvePath(path) {
        var path=path.replace(/\\/g,'/').replace(/\/\//g,'/').replace(/\/\//g,'/')
        path=path.replace(/\//g,fs.separator)
        return path
    },
    function fullPath(path) {
        return exports.resolvePath(exports.basePath()+jsExtPath+path);
    },
    function phantomHeader(path) {
        return {'X-Phantom-X':'abc'};
    },
    function inherits(ctor, superCtor) {
        ctor.super_ = superCtor;
        ctor.prototype = Object.create(superCtor.prototype, {
            constructor: {
                value: ctor,
                enumerable: false,
                writable: true,
                configurable: true
            }
        });
    },
    function defer(fn){
        var args=[];
        for(var i=1;i<arguments.length;i++){
            args.push(arguments[i])
        }
        setTimeout(function(){fn.apply(fn, args)},0);
    },
    function phsetting(){
       // phantom.outputEncoding="gbk";
        //phantom['script-encoding']="gbk"
    },
    function pgsetting(page){
        page.settings.userAgent = 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/37.0.2062.120 Safari/537.36';
        var w=1366,h=768;
        page.viewportSize = { width: w, height: h };
        page.zoomFactor =0.45
        //var w1=w*page.zoomFactor,h1=h*page.zoomFactor
        //page.clipRect = { left: w1*0.2>>>0,top: h1*0.1>>>0,  width: w1*0.7>>>0, height: h1*0.8>>>0 };
    },
    function removeWebpageArgs(){
        var newArguments= Array.prototype.slice.call(arguments);
        var flag=false;
        for(var i= newArguments.length-1;i>=0;i--) {
            var p = newArguments[i];
            if (p && p.objectName==='WebPage') {
                newArguments.splice(i, 1);
                flag=true;
            }
        }
        return flag?newArguments:false;
    },
    function ajax(url,options,fn) {
        //remove webpage
        var newArguments=exports.removeWebpageArgs.apply(null,arguments)
        if (newArguments)  return ajax.apply(null,newArguments);
        var data=options.data;
        var options=options||{};
        var headers= exports._extend(options.headers||{} ,exports.phantomHeader())
        options.method=data?'post':'get';
        options.dataType=options.dataType||'text';
        //encodeURI
        data=exports.objectType(data)==='object'?encodeURI(JSON.stringify(data)):data;
        if (options.dataType==='json'&&data){
            headers=exports._extend(headers,{"Content-Type": "application/json"}) ;
        }
        var args=[url,options.method];
        data&&args.push(data);
        args.push(headers);
        var page = webpage.create();
        args.push(function(status){
            var err;
            var value;
            if (status === 'success') {
                value=page.plainText;
                options.dataType==='json'&&(value=value?JSON.parse(value):{})
            }else{
                err=new Error(status);
            }
            fn&&fn(err,value);
        });
        page.open.apply(page,args);
        page.onError = function(msg, trace) {
            page.close();
        };
    },
    function makeJQuery (page,jqueryJs) {
        var value = page.evaluate(function() {
            return window.jQuery&&true
        });
        (!value)&& fs.exists(jqueryJs)&& page.injectJs(jqueryJs);
    },
    function injectPageJs (page,pagejs) {
        var self=this;
        //for jquery
        exports.makeJQuery(page,exports.fullPath(jqueryfile));
        Object.keys(exports).forEach(function(key){
            if ((/^injected/).test(key)){
                exports.makeEvalCall(page,exports[key],key);
            }
        });
        exports.makeEvalCall(page,exports['_lastInjectedContext__']);
        var pagejs=pagejs||[];
        pagejs.forEach(function(jsfile){
            if ((/jquery/i).test(jsfile)) return;
            var file=  exports.fullPath(jsfile);
            fs.exists(file)&& page.injectJs(file);
        })

        //value= page.evaluate(function() {
        //    return  window.openphwin&& window.openphwin.call(window);
        //});
        //value= page.evaluate(function() {
        //    return  window.intjectedCallPhantom('mytestfunc',7,8,9);
        //});
        //console.log(value+'------11111111111');
        //value=self.callBrowser(page,'myWinCall',5,6,3);
        //console.log(value+'------------33333333--'+'myWinCall')

        //start page main
        setTimeout(function(){
            var v=page.evaluate(function() {
                var fn=window.injectedMain;
                return  fn&& fn.call(window);
            });
        },0)
    },
    function injectedInnerFnCall__ (callbackid) {
        //mem leak ,when not be called
        var fn=window.__injectedInnerFnMap[callbackid];
        delete window.__injectedInnerFnMap[callbackid];
        var newArguments= Array.prototype.slice.call(arguments);
        if (typeof fn!=='function') return ;
        newArguments.splice(0,1);
        fn.apply(window,newArguments);
    } ,
    function pagecallback (fnName,page) {
        var self=this;
        var newArguments= Array.prototype.slice.call(arguments);
        var fnname=newArguments[0];
        newArguments.splice(0,1);
        for(var i= 0,n=newArguments.length;i<n;i++){
            var p=newArguments[i];
            if (typeof p==='string'&& p.slice(0,11)==='__$$$!$$$__'){
                ;!function(callbackid){
                    newArguments[i]=function(){
                        var nargs= Array.prototype.slice.call(arguments);
                        nargs.splice(0,0,page,'injectedInnerFnCall__',callbackid);
                        exports.callBrowser.apply (self,nargs);
                    }
                }(p);
            }
        }
        var fn=self.__proto__[fnname];
        fn=fn?fn:exports[fnname];
        if (!fn) return ;
        if (typeof( fn)!=='function'){
            return fn;
        }
        return fn.apply (self,newArguments);
    },
    function makeEvalCall (page,fn,injectName) {
        var src='';
        var injectName=injectName||fn.name;
        if (typeof(fn)==='function'&&injectName){
            src='window.'+injectName+'='+fn.toString();
        }
        if (typeof(fn)==='string'){
            src=fn;
        }
        page.evaluate(function(source) {
            window.eval(source)
        },src);
    },
    function callBrowser (page,fnName,a,b,c,d,e,f,g,h,k,m,n,l,o,p) {
        var self=this;
        if (!page||!fnName) return ;
        var value = page.evaluate(function(fnName,a,b,c,d,e,f,g,h,k,m,n,l,o,p) {
            var fn=window[fnName];
            if (typeof( fn)!=='function'){
                return fn;
            }
            return fn.call(window,a,b,c,d,e,f,g,h,k,m,n,l,o,p);
        },fnName+'',a,b,c,d,e,f,g,h,k,m,n,l,o,p);
        return value;
    },
    function trim(str){
        if (!str) return str;
        return str.replace(/(^\s*)|(\s*$)/g, "");
    },
    function hash(str) {
            var hash = 5381,
            i    = str.length
        while(i)
            hash = (hash * 33) ^ str.charCodeAt(--i)
        return hash >>> 0;
    },
    function isPath( path)	{
        var path=path||'/'
        return window.location.pathname.toLowerCase()===path.toLowerCase();
    },
    function injectedCallPhantom(fnname){
        for (var i = 1,numargs = arguments.length; i < numargs; i++) {
            var arg=arguments[i];
            if (typeof  arg==='undefined') arguments[i]=null;
            if (typeof arg==='function'){
                var fn=arg;
                var callbackid=window.injectedHash(fn.toString());
                var r=''+(Math.random()*10>>>0)+(Math.random()*10>>>0)+(Math.random()*10>>>0)+(Math.random()*10>>>0)
                callbackid ='__$$$!$$$__'+callbackid+'-'+(new Date()).getTime()+'-'+r;
                window.__injectedInnerFnMap[callbackid]=fn;
                arguments[i]=callbackid;
            }
        }
        var value;
        if (typeof window.callPhantom === "function") {
            value= window.callPhantom.apply(window,arguments);
        }
        return value;
    },
    function  imageBase64(img) {
        var canvas = window.document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        var ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, img.width, img.height);
        var dataURL = canvas.toDataURL("image/png");
        //var dataURL = canvas.toDataURL("image/jpg");
        return dataURL
        // return dataURL.replace("data:image/png;base64,", "");
    },
    function waitFor(testFx, onReady, timeOutMillis,onTimeout) {
        var onTimeout=onTimeout||''
        var onReady=onReady||''
        var maxtimeOutMillis = timeOutMillis ? timeOutMillis : 3000,
            start = new Date().getTime(),
            condition = false,
            interval = setInterval(function() {
                condition = (typeof(testFx) === "string" ? eval(testFx) : testFx());
                if (new Date().getTime() - start >= maxtimeOutMillis||condition){
                    clearInterval(interval);
                    if (condition){
                        typeof(onReady) === "string" ? eval(onReady) : onReady();
                    }else{
                        typeof(onTimeout) === "string" ? eval(onTimeout) : onTimeout();
                    }
                }
            }, 200);
    },
    function EventEmitter() {
        var self = this;
        self._events = {};
        self.emit = function (type) {
            var listeners = self._events[type] || [];
            var newArguments=[];
            for (var i = 1,numargs = arguments.length; i < numargs; i++) {
                newArguments.push(arguments[i]);
            }
            for (var i = 0, n = listeners.length; i < n; i++) {
                listeners[i].apply(self, newArguments);
            }
        }
        self.on = function (type, listener) {
            if (!type || typeof listener !== 'function') return;
            self._events[type]?self._events[type].push(listener):(self._events[type]=[listener]);
        };
    }
].forEach(function(func){
        exports[func.name]=func;
    });



var injectedContext__= function (){
    window.__injectedInnerNative={};
    ;!function(){
        var keys=Object.keys(window);
        for(var i=0,n=keys.length;i<n;i++){
            var keyname=keys[i];
            var alias=keyname.match(/^injected([\s\S]+$)/)
            if (!alias){ continue}
            alias=alias[1];
            alias=alias.charAt(0).toLowerCase()+alias.slice(1);
            if (typeof window[keyname]==='function'){
                alias= window[keyname].name||alias;
            }
            window.__injectedInnerNative[alias]=window[keyname];
        }
    }();
    window.__injectedInnerFnMap={};
    window.$phph$=function(fnName){
        var phph={}
        if (fnName==='#'){
            phph=window.__injectedInnerNative;
        }else{
            phph.fn=function(){
                var newArguments= Array.prototype.slice.call(arguments);
                newArguments.splice(0,0,fnName)
                return window.injectedCallPhantom.apply(window,newArguments);// ('mytestfunc',40,50,60,callbackid,{bbb:'aaabcc'});
            }
        }
        return phph;
    }
}

exports._lastInjectedContext__=';!'+injectedContext__.toString()+'();'


;!function(){

}()


exports.InjectedEventEmitter=exports.EventEmitter;
exports.injectedWaitFor= exports.waitFor;
exports.injectedHash= exports. hash;
exports.injectedTrim=exports.trim;
exports.injectedIsPath=exports.isPath;

exports.injectedImageBase64=exports.imageBase64;
//injectedImageBase64

/*
*
* objectName,title,frameTitle,content,frameContent,url,frameUrl,loading,loadingProgress,canGoBack,canGoForward,plainText,
 framePlainText,libraryPath,offlineStoragePath,offlineStorageQuota,viewportSize,paperSize,clipRect,scrollPosition,navigationLocked,
 customHeaders,zoomFactor,cookies,windowName,pages,pagesWindowName,ownsPages,framesName,frameName,framesCount,focusedFrameName,
 cookieJar,destroyed(QObject*),destroyed(),objectNameChanged(QString),deleteLater(),initialized(),loadStarted(),
 loadFinished(QString),javaScriptAlertSent(QString),javaScriptConsoleMessageSent(QString),
 javaScriptErrorSent(QString,int,QString,QString),resourceRequested(QVariant,QObject*),resourceReceived(QVariant),
 resourceError(QVariant),resourceTimeout(QVariant),urlChanged(QUrl),navigationRequested(QUrl,QString,bool,bool),
 rawPageCreated(QObject*),closing(QObject*),repaintRequested(int,int,int,int),openUrl(QString,QVariant,QVariantMap),
 release(),close(),evaluateJavaScript(QString),render(QString,QVariantMap),render(QString),renderBase64(QByteArray),
 renderBase64(),injectJs(QString),_appendScriptElement(QString),_getGenericCallback(),_getFilePickerCallback(),_getJsConfirmCallback(),
 _getJsPromptCallback(),_getJsInterruptCallback(),_uploadFile(QString,QStringList),sendEvent(QString,QVariant,QVariant,QString,QVariant),
 sendEvent(QString,QVariant,QVariant,QString),sendEvent(QString,QVariant,QVariant),sendEvent(QString,QVariant),sendEvent(QString),
 setContent(QString,QString),getPage(QString),childFramesCount(),childFramesName(),switchToFrame(QString),switchToChildFrame(QString),
 switchToFrame(int),switchToChildFrame(int),switchToMainFrame(),switchToParentFrame(),switchToFocusedFrame(),currentFrameName(),
 setCookieJar(CookieJar*),setCookieJarFromQObject(QObject*),cookieJar(),setCookies(QVariantList),cookies(),addCookie(QVariantMap),
 deleteCookie(QString),clearCookies(),canGoBack(),goBack(),canGoForward(),goForward(),go(int),reload(),stop(),stopJavaScript(),clearMemoryCache()
* */

