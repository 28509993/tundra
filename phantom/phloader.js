/**
 * Created by Administrator on 2015/4/21.
 */
    /*
     var  injectedStatus={uninitialized, ready ,    waiting ,    success ,    failure};
     var injectedEvent={initialize,changePage}
     */
var DEBUG=false;
var system = require('system');
var webpage = require('webpage');
var fs = require('fs');

if (system.args.length<=1)  phantom.exit(1);

var task;
var taskClone={};
var proxyUrls=[];
var cookiefile;
var taskUnique=system.args[1];
var mainHost = system.args[2];
var zoomFactor=0.85;
function allExit(code){
    console.log('result:---'+JSON.stringify(task))
    if (cookiefile){
        var dest=cookiefile+'.tmp';
        /*
        if (fs.exists(dest)){
            fs.remove(dest);
        }
        fs.copy(cookiefile,dest);*/
        fs.write(dest, fs.read(cookiefile), 'w');
    }
    phantom.exit(code||0);
}
function _extend(a,b){
    if (!a||!b) return a;
    for(var i in b){
        a[i]=b[i];
    }
    return a;
}

function getRemoteData(url,fn){
    var page = webpage.create();
    page.open(url, 'get',  function (status) {
        if (status !== 'success') {
            allExit(1)
        }
        try{
            fn(JSON.parse(page.plainText)) ;

        }catch(e){
            console.log(url);
            console.log(page.plainText);
            allExit(2)
        }
        page.close();
    });
    page.onError = function(msg, trace) {
        allExit(3)
    };
}

function postRemoteData(url,data,fn){
    var page = webpage.create();
    page.open(url, 'post', data, function (status) {
        if (status !== 'success') {
            allExit(4)
        }
        fn(page.plainText) ;
        page.close();
    });
    /*
    page.onResourceReceived = function(resource) {

        if (resource.url == url) {
            status_code = resource.status;
        }
        console.log(resource.status+'sttts');
    };*/
    page.onError = function(msg, trace) {
        allExit(5)
    };
}

function postRemoteJson(url,data,fn){
    var page = webpage.create();
    var headers = {
        "Content-Type": "application/json"
    }
    page.open(url, 'post', data,headers, function (status) {
        if (status !== 'success') {
            allExit(6)
        }
        fn(page.plainText) ;
        page.close();
    });
    page.onError = function(msg, trace) {
        allExit(1)
    };
}


function getXTask(fn){
    var url=mainHost+'/getXTask?unique='+taskUnique;
    getRemoteData(url,function(data){
        task=data;
        DEBUG=task.DEBUG
        task['DEBUG']&&delete task['DEBUG'];
        console.log(DEBUG);
        task['mainHost']&&delete task['mainHost'];
        cookiefile=task['cookiefile'];
        task['cookiefile']&&delete task['cookiefile'];
        var timeout=task.timeout?task.timeout*1000-(new Date()).getTime():0;
        timeout= timeout<60*1000?1000*60*3:timeout;
        task['timeout']&&delete task['timeout'];
        task['unique']&&delete task['unique'];
        proxyUrls=proxyUrls.concat(task['proxyUrls']||[],task['proxyUrls']||[]);
        task['proxyUrls']&&delete task['proxyUrls'];
        taskClone=_extend({},task);
        setTimeout(function(){
            allExit(7)
        },60000); //timeout
        fn();
    })
}


function pagerenderBase64(page){
    if (!page||!DEBUG) return ;
    var viewUrl=mainHost+'/pageviewXZoom?unique='+taskUnique;
    task&&task.seq&&(viewUrl=viewUrl+'&seq='+task.seq)
    page.zoomFactor = zoomFactor;
    //page.render('c:\\phantomjs\\'+(new Date()).getTime()+'.png');
    postRemoteData(viewUrl,page.renderBase64('PNG'),function(){

    })
}

function openWebPage(url,fn){
    var page = webpage.create();
    page.settings.userAgent = 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/37.0.2062.120 Safari/537.36';
    page.viewportSize = { width: 1366, height: 768 };
    page.clipRect = { left: 240,top: 100,  width: 886, height: 420 };

    page.open(url, function(status) {
        if (status !== 'success') {
            allExit(8)
        }
        console.log(JSON.stringify(page.cookies));
        fn(page);
    });
    page.onError = function(msg, trace) {
        var msgStack = ['ERROR: ' + msg];
        if (trace && trace.length) {
            msgStack.push('TRACE:');
            trace.forEach(function(t) {
                msgStack.push(' -> ' + t.file + ': ' + t.line + (t.function ? ' (in function "' + t.function +'")' : ''));
            });
        }
        console.error(msgStack.join('\n'));
        allExit(9)
    };
    /*
    page.onUrlChanged = function(targetUrl) {
        setTimeout(function(){ pagerenderBase64(page);},1500)
    };*/

    page.onCallback = function(options) {
        var options=options||{};
        if ( options.injectedStatus&&task.injectedStatus!==options.injectedStatus&&options.injectedStatus!=='waiting'){
            pagerenderBase64(page);
        }
        options.injectedStatus==='ignored'&&(delete options['injectedStatus']);
        _extend(task,options);
        return task;
    };
    return page;
}

function initialize(page){
    if (!task) return ;
    try{
        page.evaluate(function() {
            injectedEventEmitter.emit('initialize');
        })
    }catch (e){
        allExit(20)
    }

}

var interval;
function waitForFlag(page) {
    var preInjectedStatus;
    interval&&clearInterval(interval);
    interval = setInterval(function () {
        if (!task) return ;
        var status=task.injectedStatus;
        if (preInjectedStatus!==status){
            console.log(status)
        }
        preInjectedStatus=status;
        if (status==='uninitialized'){
            initialize(page);
        }else if (status==='success'){
            clearInterval(interval);
            var url=mainHost+'/finishXTask?unique='+taskUnique;
            getRemoteData(url,function(){
                allExit(0)
            })
        }else if (status==='failure'){
            clearInterval(interval);
            if (proxyUrls.length>0){
                doTask();
            }else{
                try{
                    page.evaluate(function() {
                        injectedEventEmitter.emit('fail');
                    })
                }catch(e){
                    allExit(21)
                }
                var url=mainHost+'/finishXTask?unique='+taskUnique;
                getRemoteData(url,function(){
                    allExit(0)
                })
            }
            allExit(0)
        };
    }, 1250);

};



function doTask(){
    if (!taskClone) return  allExit(10);
    if (proxyUrls.length<=0) {
        return  allExit(11);
    }
    task=_extend({},taskClone);
    var url=proxyUrls.shift();
    openWebPage(url,function(page){
        waitForFlag(page);
    })
}

;!function(){
    //console.log('begin phantomjs...............')
    getXTask(doTask);
}();

/*
page.open('http://localhost:60011/getXTask?unique='+taskUnique, 'get',  function (status) {
    if (status !== 'success') {
        allExit(1)
    }
    try{
        console.log(page.plainText);
    }catch(e){
        allExit(1)
    }
    page.close();
});*/


//http://www.2cto.com/kf/201308/234264.html
//http://www.tuicool.com/articles/nieEVv
//page.viewportSize = { width: 1366, height: 768 };