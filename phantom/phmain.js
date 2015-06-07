/**
 * Created by Administrator on 2015/4/27.
 */
//var DEBUG=false;
var system = require('system');
var webpage = require('webpage');
var fs = require('fs');
if (system.args.length<=1)  phantom.exit(1);
var mainHost=system.args[1];
var options={};
var phpub=require('./phpublic.js');
var phtask=require('./phtask.js')
var ee=new phpub.EventEmitter();

phpub.phsetting(options);

//separator JSON.stringify(fs.separator)
 var demoUrl=  { keyexpr: '浙',
    url: 'http://localhost:60059/',
    injected: [ 'phantom-demo.js' ],
    busiType: 'demo',
    matchKey: 'illegal浙' };

var idleTime=1000;
function getTask(){
    var url=options.midware+'/getTask';
    var opts={method:'get',dataType:'json'}
    var ttout=setTimeout(function(){ ee.emit('getTask'); },2000);

    phpub.ajax(url,opts,function(err,rawtask){
        clearTimeout(ttout);
        if (!rawtask.seq){
            setTimeout(function(){ ee.emit('getTask'); },idleTime);
            idleTime=idleTime+idleTime;
            var r=20000*Math.random()>>>0;
            r=r+500;
            idleTime=idleTime>20000?r:idleTime;
            return;
        }
        idleTime=1000;
        if (rawtask.busiType==='demo'){
            rawtask.proxyUrls=[demoUrl];
        }
        var task=phtask.create(rawtask,  phpub._extend({},options) );
        task.go();
        task.on('finished',function(){
            ee.emit('getTask');
        });
    });
}

function getOptions(){
    var url=mainHost+'/Options';
    var opts={method:'get',dataType:'json'}
    var ttout=setTimeout(function(){ phantom.exit(1);; },2000);
    phpub.ajax(url,opts,function(err,opts){
        clearTimeout(ttout);
        if (err) return phantom.exit(1);
        options=phpub._extend(options,opts);
        ee.emit('getTask');
    });
}

;!function(){
    ee.on('getTask',getTask);
    getOptions();
}();

//setTimeout(function(){phantom.exit(0);},601500)

//var system = require('system');
//var fs = require('fs');

//phantomjs --cookies-file=c:\phantom\aadfd.txt --web-security=no  d:\ecartoo\tundra\phantom\phmain.js http://localhost:60001
//phantomjs --web-security=no  d:\ecartoo\tundra\phantom\phmain.js http://localhost:60001
//phantomjs --web-security=no  d:\ecartoo\tundra\phantom\phtest.js 3432369156 http://127.0.0.1:60011
//http://www.zjsgat.gov.cn:8080/was/portals/car_lllegal_query.jsp
//http://www.sogou.com/
//http://localhost:60059/
//http://www.hzgas.com.cn/gywm.htm
//http://localhost:19571/was/portals/car_lllegal_query.jsp
//var cookies=[{"domain":"localhost","httponly":false,"name":"arrayid","path":"/","secure":false,"value":"r-gatbsdt2"},{"domain":"localhost","httponly":false,"name":"com.trs.idm.coSessionId","path":"/was","secure":false,"value":"1B5F27587B0066028D1C061A95843DB0"},{"domain":"localhost","httponly":false,"name":"JSESSIONID","path":"/was","secure":false,"value":"1B5F27587B0066028D1C061A95843DB0"}]
//for (var i= 0,n=cookies.length;i<n;i++){
//    phantom.addCookie(cookies[i]);
//}
//console.log(system.args);
//var wasSuccessful = phantom.injectJs('phpublic.js');


var url1='http://127.0.0.1:60059/testdemo';
var options1={method:'post',dataType:'json',headers:{},data:{a:1,b:3}}

/*
pub.pajax(url1,options1,function(err,data){
    console.log(JSON.stringify( data))
    console.log('pajax complete')
});

var task=  phtask.create();
 console.log('pajax end');
*/


//console.log(JSON.stringify(pub.pajax));
//console.log(wasSuccessful);
//console.log(injectedtHash( 'aaaaaaaaabc'))
//'http://www.hzgas.com.cn/gywm.htm'



/*
 page.open('http://127.0.0.1:60059/testdemo', function(status) {
 //console.log('Status: ' + status);
 //console.log(JSON.stringify(page.cookies));
 //console.log(JSON.stringify(phantom));
 //var content = fs.read('file.txt','r');
 //fs.copy("c:\\phantomjs\\cookies\\12172\\1520298811.txt", "c:\\phantomjs\\cookies\\12172\\1520298811.txt.tmp");
 //console.log(content);

 var eval = page.evaluate(function() {
 return typeof jQuery !== 'undefined';
 });
 if (!eval){
 page.injectJs('D:\\ecartoo\\tundra\\app\\!public\\!injected-jquery.js');
 }
 page.injectJs('D:\\ecartoo\\tundra\\app\\!public\\!injected-public.js');
 eval = page.evaluate(function() {
 return $('#injected-data').val()
 });
 //console.log(JSON.stringify(str));
 console.log(eval);

 setTimeout(function(){phantom.exit(0);},2000)
 //setTimeout(function(){phantom.exit(0)},100200)

 });*/

//setTimeout(function(){phantom.exit(0);},1000000)