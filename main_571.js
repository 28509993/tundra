

var http = require('http')
    ,path = require('path')
    , fs = require('fs')
    , exec = require('child_process').exec
    ,options=require('./setting.json')
    ,helper=require('./lib/core/helper')
helper.initLog(options.log);
var logger=helper.getLogger();
logger.error("it is error!")
logger.info("it is info!")
logger.warn("it is warn!")
//exec('gulp', ['all']); ,for product
//depoly web file,for dev
//exec('gulp');
options.isAutoProxy=true;
var startServer=helper.startServerHander(options);

startServer(require('./app/zj/proxy-19571'),19571);
/*
startServer(require('./app/zj/proxy-10570'),10570);
startServer(require('./app/zj/proxy-10571'),10571);
startServer(require('./app/zj/proxy-10572'),10572);
startServer(require('./app/zj/proxy-10573'),10573);
startServer(require('./app/zj/proxy-10574'),10574);
startServer(require('./app/zj/proxy-10575'),10575);
startServer(require('./app/zj/proxy-10576'),10576);
startServer(require('./app/zj/proxy-10577'),10577);
startServer(require('./app/zj/proxy-10578'),10578);
startServer(require('./app/zj/proxy-10579'),10579);
startServer(require('./app/zj/proxy-10580'),10580);
startServer(require('./app/zj/proxy-10010'),10010);
startServer(require('./app/zj/proxy-10021'),10021);*/

helper. copy(path.resolve("app/zj/injected/!injected-19571.js") , path.resolve("public/zj/injected-19571.js"))

//for  中文需要GBK js
/*
function utf82gbk(file){
    var iconv = require('iconv-lite');
    var data= fs.readFileSync(file) ;
    data= iconv.decode(data, 'utf-8');
    data=iconv.encode(data,'gbk')
    fs.writeFileSync(file,data) ;
}
setTimeout(function(){
    var file = path.resolve("public/zj/injected-19571.js");
    utf82gbk(file);
    },3000);
*/
//startServer(require('./app/zj_hz_cg/app_zj_hz_cg'),3333);


//http://www.jb51.net/article/48467.htm
//http://www.jb51.net/article/52118.htm
//http://www.zjsgat.gov.cn:8080/was/portals/car_lllegal_query.jsp

//http://localhost:3102/was/portals/car_lllegal_query.jsp