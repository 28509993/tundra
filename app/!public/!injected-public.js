/**
 * Created by Administrator on 2015/4/12.
 */
/*
var  injectedStatus={uninitialized, ready ,  waiting ,  complete  success ,    failure,ignored};
var injectedEvent={initialize,onready,fail}
*/
function InjectedEventEmitter(){
    this._events = {};
}
InjectedEventEmitter.prototype.emit = function(type) {
    if (!this._events) return ;
    var listeners =this._events[type];
    if (!listeners||listeners.length<=0) return ;
    for (var i = 0,n=listeners.length; i < n; i++) {
        listeners[i].apply(this, arguments);
    }
}

InjectedEventEmitter.prototype.on = function(type, listener) {
    if (!type||typeof listener !== 'function') return ;
    var evts;
    ( evts=this._events[type])||(evts=this._events[type]=[]);
    evts.push(listener)
}

var  injectedEventEmitter=new InjectedEventEmitter();

function injectedtHash(str) {
    var hash = 5381,
        i    = str.length
    while(i)
        hash = (hash * 33) ^ str.charCodeAt(--i)
    return hash >>> 0;
}

function injectedTrim(str){
    if (!str) return str;
    return str.replace(/(^\s*)|(\s*$)/g, "");
}

function injectedExtend(a,b){
    if (!a||!b) return a;
    for(var i in b){
        a[i]=b[i];
    }
    return a;
}
//extend

function injectedSuccess() {
    var data=injectedData();
    data.TResult='success';
    injectedReturnXTask(data,function(){
        injectedStatus('success');
    })
}

function injectedFail() {
    var data=injectedData();
    data.TResult='failure';
    injectedReturnXTask(data,function(){
    })
}

function injectedReturnXTask(data,cb,trycount) {
    data['injectedStatus']&&(delete data['injectedStatus'])
    var trycount=trycount===undefined?5:trycount
    var url='/returnXTask';
    $.ajax ({
        url: url,
        contentType: "application/json",
        data:JSON.stringify( data),
        type: "post",
        dataType: "json",
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            if (trycount>0){
                injectedPostXIicTimer=setTimeout(function(){injectedReturnXTask(data,cb,trycount-1)},500)
            }else{
                injectedStatus('failure')
            }
        },
        success:function(d){
            cb();
        }
    });

}

function injectedWriteXCache(data,cb) {
    $.post('/writexCache',data||'',function(data,status,xhr){
        var err=status==='success'?undefined:new Error();
        cb&&(cb(err,data))
    },'text')
}

function injectedReadXCache(cb) {
    $.get("/readxCache",function(data,status,xhr){
        var err=status==='success'?undefined:new Error();
        cb&&(cb(err,data));

    });
}

var injectedPostXIicTimer;
function injectedPostXIic(data,trycount) {
    var trycount=trycount===undefined?5:trycount
    if (injectedPostXIicTimer) clearTimeout(injectedPostXIicTimer);
    injectedPostXIicTimer=null;
    var task=injectedData();
    if (!task||!task.seq) {
        injectedStatus('failure')
        return ;
    }
    task.iicseq=injectedtHash(data);
    //injectedData(JSON.stringify(task));
    injectedData({iicseq:task.iicseq});
    var url='/postXIic?seq='+task.iicseq+'&oldseq='+task.seq;
    $.ajax ({
        url: url,
        data:data,
        type: "post",
        dataType: "text",
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            if (trycount>0){
                injectedPostXIicTimer=setTimeout(function(){injectedPostXIic(data,trycount-1)},3000)
            }else{
                injectedStatus('failure')
            }
        }
    });
}

var injectedGetXIicTimer
function injectedGetXIic(fn,trycount) {
    var trycount=trycount===undefined?145:trycount
    if (injectedGetXIicTimer) clearTimeout(injectedGetXIicTimer);
    injectedGetXIicTimer=null;
    var task=injectedData();

    if (!task||!task.seq||!task.iicseq) {
        injectedStatus('failure')
        return ;
    }
    $.ajax ({
        url: '/getXIic',
        data:{seq:task.iicseq},
        type: "get",
        dataType: "json",
        success: function (data) {
            if (data&&data.value){
                fn(data.value);
            }else{
                if (trycount>0){
                    injectedGetXIicTimer=setTimeout(function(){injectedGetXIic(fn,trycount-1)},2000)
                }else{
                    injectedStatus('failure')
                }
            }
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            if (trycount>0){
                injectedGetXIicTimer=setTimeout(function(){injectedGetXIic(fn,trycount-1)},2000)
            }else{
                injectedStatus('failure')
            }
        }
    });
}
function injectedtBase64Image(img) {
    var canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    var ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, img.width, img.height);
    var dataURL = canvas.toDataURL("image/png");
    //var dataURL = canvas.toDataURL("image/jpg");
    return dataURL
    // return dataURL.replace("data:image/png;base64,", "");
}

function injectedData(options){
    var data=intjectedCallPhantom(options||{});
    if (data){
        $("#injected-data").val(JSON.stringify(data))
        return data ;
    }else{
        var oldData=JSON.parse($("#injected-data").val());
        if (options){
            for(var i in options){
                oldData[i]=options[i];
            }
            $("#injected-data").val(JSON.stringify(oldData));
        }
        return oldData;
    }
}

function injectedStatus(sts){
    var data=intjectedCallPhantom( sts?{injectedStatus:sts}:{});
    if (data){
        $("#injected-flag").val(data.injectedStatus)
        return data.injectedStatus;
    }else{
        sts&&(sts!=='ignored')&&$("#injected-flag").val(sts);
        return $("#injected-flag").val();
    }
}

function intjectedCallPhantom(options){
    var value;
    if (typeof window.callPhantom === 'function') {
        value= window.callPhantom(options||{});
    }
    return value;
}

injectedEventEmitter.on('initialize',function(){
    var data=injectedData();
    if (!data){
        injectedStatus('uninitialized')
        return ;
    }
    injectedStatus('ready');
    injectedEventEmitter.emit('onready');
});

injectedEventEmitter.on('fail',function(){
    injectedFail();
});

//---------------ext
function injectedXHtml(){
    var obj=document.createElement("div");
    document.body.appendChild(obj);
    obj.innerHTML= '<div><input id="injected-result" type="text"  /> </div>'
        + '<div><input id="injected-flag" type="text"  /> </div>'
        + '<div><input id="injected-data" type="text"  value="356373" /> </div>';
}
//injectedXHtml();
