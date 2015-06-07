/**
 * Created by Administrator on 2015/4/28.
 */

var system = require('system');
var webpage = require('webpage');
var fs = require('fs');

var phpub=require('./phpublic.js')
var cacheCookie={}

//var  injectedStatus={ready ,  waiting ,  complete  success ,failure,ignored};
//value= page.evaluate( 'function(){ window.projectinjext2=2}');
exports.create=function (rawtask,options){
    var options=phpub._extend({},options);
    var manage=new TaskManage();

    ;!function(){
        var timeout=rawtask.timeout?rawtask.timeout-((new Date()).getTime()/1000>>>0):0;
        timeout= timeout<90?90:timeout;
        options.DEBUG =rawtask['DEBUG'];
        options.timeout =timeout;
        options.openTimeout =10000;
        options.unique =rawtask['unique'];
        options.proxyUrls =[].concat(rawtask['proxyUrls']||[],rawtask['proxyUrls']||[]);
        rawtask['DEBUG']&&delete rawtask['DEBUG'];
        rawtask['timeout']&&delete rawtask['timeout'];
        rawtask['unique']&&delete rawtask['unique'];
        rawtask['proxyUrls']&&delete rawtask['proxyUrls'];
        //taskClone=phpub._extend({},rawtask);
    }();
    manage.rawtask=rawtask;
    manage.options=options;
    manage.innerTask=undefined;
    manage.waitMonitor=undefined;
    manage.status=undefined;
    manage.phantomjs= {curPage:undefined,curPages:[], allPages:[]};
    return manage;
}

function TaskManage(){
    phpub.EventEmitter.call(this)
    this.seq='ddddddd';
}
//phpub.inherits(TaskManage, EE);

function initialize () {
    var self=this;
    var proxyUrl=self.options.proxyUrls.shift();
    self.waitMonitor&&clearTimeout(self.waitMonitor);
    if (!proxyUrl) return  closeTask.call(self,true);
    self.status=undefined;
    self.innerTask=phpub._extend({},self.rawtask);
    self.waitMonitor=setTimeout(function(){
        closeTask.call(self);
    },self.options.timeout*1000 );
    startOpenPage.call(self,proxyUrl);
}

function startOpenPage (proxyUrl) {
    var self=this;
    var url=proxyUrl.url;
    phantom.clearCookies2=function(){
        cacheCookie[url]=phantom.cookies||[];
        phantom.clearCookies()
    };
    if (cacheCookie[url]){
        phantom.clearCookies();
        (cacheCookie[url]).forEach(function(cok){
            phantom.addCookie(cok);
        })
    }

    var page = webpage.create();
    phpub.pgsetting(page);
    //self.phantomjs.startUrl= proxyUrl;
    self.phantomjs.curPage= page;
    self.phantomjs.curPages= [];
    //self.phantomjs.allPages.push(page);
    page.customHeaders =phpub.phantomHeader();
    page.open(url, function(status) {
        if (status !== 'success')  return closeTask.call(self);
        //console.log(JSON.stringify(page.cookies));
        //phantom.exit(0);
    });
    bindPageHandler.call(self,page,proxyUrl.injected);
}



function bindPageHandler (page,injected) {
    var self=this;
    var ttout=setTimeout(function(){
        closeTask.call(self);
    },self.options.openTimeout);
    self.phantomjs.curPages.push(page);
    self.phantomjs.allPages.push(page);
    page.customHeaders =phpub.phantomHeader();
    page.onCallback=function(){
        var newArguments= Array.prototype.slice.call(arguments);
        newArguments.splice(1,0,page);
        return phpub.pagecallback.apply(self,newArguments);
    }
    page.onError = function(msg, trace) {
        var msgStack = ['ERROR: ' + msg];
        if (trace && trace.length) {
            msgStack.push('TRACE:');
            trace.forEach(function(t) {
                msgStack.push(' -> ' + t.file + ': ' + t.line + (t.function ? ' (in function "' + t.function +'")' : ''));
            });
        }
        console.error(msgStack.join('\n'));
        closeTask.call(self);
    }
    page.onPageCreated = function(newPage){
        phpub.pgsetting(newPage);
        //self.phantomjs.curPage= newPage;
        bindPageHandler.call(self,newPage,injected)
    };
    page.onLoadFinished = function(){
        //page.onLoadFinished=null;
        clearTimeout(ttout);
        phpub.injectPageJs.call(self,page,injected||[]);
    };
}



function closeTask (isEnd) {
    var self=this;
    console.log('close    =   '+isEnd+' status='+self.status+'  page count='+ self.phantomjs.allPages.length)
    phantom.clearCookies2();
    self.waitMonitor&&clearTimeout(self.waitMonitor);
    self.phantomjs.allPages.forEach(function(page){
        page.close();
    });
    self.phantomjs.allPages=[];
    if (!isEnd){
        self.go();
    }else{
        if (self.status=='success'){
            //self.innerTask.result=true;
        }else{
            //self.innerTask.result=false;
            self.emit('finished')
        }
        var redo=2;
        ;!function saveTask(){
            if (!self.options['bizware']){
                return;
            }
            redo--;
            var url=self.options['midware'] +'/saveTask';
            var opts={method:'post',dataType:'json',data:self.innerTask};
            phpub.ajax(url,opts,function(err){
                if (err){
                    saveTask();
                }
                if (!err||redo<=0){
                    self.emit('finished')
                }
            })
        }();
    }
}

TaskManage.prototype.mytestfunc = function(page,a,b,c,fn) {
    var self=this;
    //console.log(page.title)
    var a=a||'';
    var b=b||'';
    var c=c||'';
    var str= 'mytestfunc:'+a+b+c+'--------'+page.title;
    console.log(str);
    fn&&fn('f1','f2','f3');

    page.evaluate(function() {
       // return  window.openphwin&& window.openphwin.call(window);
    });

    return str;
}

TaskManage.prototype.mycallBrowser = function(page,a,b,c) {
    var self=this;
    var value=phpub.callBrowser.call(self,page,'injectTestDatea',1,2,3); //injectTestDatea myWinCall
    return value
}

//

TaskManage.prototype.status = function(page,status) {
    var self=this;
    if (self.options.DEBUG&&status&& status!==self.status &&status!=='waiting'){
       self. renderBase64(page);
    }
    if (status&&status!=='ignored'){
        self.status=status
    }
    if (status==='success'){
        closeTask.call(self,true);
    }else  if (status==='failure'){
        closeTask.call(self);
    }
    return self.status;
}

TaskManage.prototype.task = function(page,data) {
    var self=this;
    self.innerTask=phpub._extend(self.innerTask,data||{});
    return self.innerTask
}

TaskManage.prototype.taskOptions = function(page) {;
    return this.options
}

TaskManage.prototype.renderBase64 = function(page) {
    var self=this;
    if (!self.options['bizware']){
        return;
    }
    var viewUrl=self.options['bizware'] +'/pageviewXZoom?seq='+self.innerTask.seq;
    var opts={method:'post',data:page.renderBase64('PNG')};
    phpub.ajax(viewUrl,opts,function(err){
    })
}


TaskManage.prototype.go = function() {
    var self=this;
    phpub.defer(function(){
        //self.emit('finished')
        initialize.call(self)
    })
}


//cacheCookie phantom.cookies




//console.log( JSON.stringify(webpage.create().__proto__)   +'-------instance')
