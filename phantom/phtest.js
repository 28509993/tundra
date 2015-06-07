/**
 * Created by Administrator on 2015/4/27.
 */
var webPage = require('webpage');
var page = webPage.create();
//var system = require('system');
//var fs = require('fs');


//phantomjs --web-security=no  d:\ecartoo\tundra\phantom\phtest.js
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
var phpub=require('./phpublic.js')
var task=require('./phtask.js').create();

var url1='http://127.0.0.1:60059/testdemo';
var options1={method:'post',dataType:'json',headers:{},data:{a:1,b:3}}

phantom.outputEncoding="gbk";
phpub.pajax(url1,options1,function(err,data){
    console.log(JSON.stringify( data))
    console.log('pajax complete')
});

var ee=new phpub.EventEmitter();
ee.on('123',function(dta){
    console.log(dta)
})
ee.emit('123','abc');
console.log(task.seq+'------------')

console.log('pajax end');

//console.log(JSON.stringify(pub.pajax));
//console.log(wasSuccessful);
//console.log(injectedtHash( 'aaaaaaaaabc'))
//'http://www.hzgas.com.cn/gywm.htm'

setTimeout(function(){phantom.exit(0);},1500)

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