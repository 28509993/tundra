/**
 * Created by Administrator on 2015/3/19.
 */
var httpProxy = require('http-proxy')
    , http = require('http')
    , request = require('request')
    , fs = require('fs')
    ,readline = require('readline')
    ,zlib = require('zlib')
    ,Readable  = require('stream').Readable
    , iconv = require('iconv-lite')
    , BufferHelper = require('bufferhelper')
    , util = require('util')
    , Q = require('q');


function getCookSession(ssid,jssid){
    var str= 'com.trs.idm.coSessionId='+ssid+'; JSESSIONID='+jssid+'; arrayid=r-gatbsdt2; __FTabcfffgh=2015-3-20-8-0-33; __NRUabcfffgh=1426809633814; __RTabcfffgh=2015-3-20-8-0-33';
    return str;
}




function car_lllegal_query(){
    var opt = {
        host:'www.zjsgat.gov.cn',
        port:'8080',
        method:'GET',
        path:'/was/portals/car_lllegal_query.jsp',
        headers: { host: 'www.zjsgat.gov.cn:8080',
            connection: 'keep-alive',
            'cache-control': 'max-age=0',
            accept: 'image/webp,*/*;q=0.8',
            'user-agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2272.89 Safari/537.36',
            referer: 'http://www.zjsgat.gov.cn:8080/was/portals/car_lllegal_query.jsp',
            'accept-encoding': 'gzip',
            'accept-language': 'zh-CN,zh;q=0.8,en;q=0.6'
           //, cookie: 'com.trs.idm.coSessionId=C2F11F4E246C08D55C670736A27E0CBF; JSESSIONID=607955144365DA2F21160B53B3AB92F0; arrayid=r-gatbsdt2; __FTabcfffgh=2015-3-20-8-0-33; __NRUabcfffgh=1426809633814; __RTabcfffgh=2015-3-20-8-0-33'
           }
    }
    //var body = '';
    var deferred = Q.defer();
    var req = http.request(opt, function(res) {
        console.log("Got response: " + res.statusCode);

        if (res.statusCode == 200) {
            var bufferHelper = new BufferHelper();
            res.on('data',function(chunk){
                bufferHelper.concat(chunk)
            }).on('end', function(){
                //var html = iconv.decode( bufferHelper.toBuffer(), 'GBK' );
                //console.log( html );
                var html = iconv.decode( bufferHelper.toBuffer(), 'GBK' );
                //var html = Buffer.concat(list, len);
                //html = iconv.decode( html, 'GBK' );
                console.log('car_lllegal_query ok');
                deferred.resolve(html);
            });
        }

    }).on('error', function(e) {
        console.log("Got error: " + e.message);
        deferred.reject(e);
    })
    req.end();
    return deferred.promise;
}


function car_ident_image(){
    var url="/was/Kaptcha.jpg?"+Math.floor(Math.random()*100);
    var opt =   {
        host:'www.zjsgat.gov.cn',
        port:'8080',
        method:'GET',
        path:url,
        headers:{ host: 'www.zjsgat.gov.cn:8080',
            connection: 'keep-alive',
            accept: 'image/webp,*/*;q=0.8',
            'user-agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2272.89 Safari/537.36',
            referer: 'http://www.zjsgat.gov.cn:8080/was/portals/car_lllegal_query.jsp',
            'accept-encoding': 'gzip',
            'accept-language': 'zh-CN,zh;q=0.8,en;q=0.6',
            cookie: 'com.trs.idm.coSessionId=C2F11F4E246C08D55C670736A27E0CBF; JSESSIONID=607955144365DA2F21160B53B3AB92F0; connect.sid=s%3A4ERR0gfDnlbetS569r0Pg4wO6LrwpEA1.UjSpOXUReQwueB%2FayvpV8uhswSiHmQcH9GJhDyIwVks; USER_ID=1000000594; arrayid=r-gatbsdt1; __FTabcfffgh=2015-3-19-8-57-39; __NRUabcfffgh=1426726659473; __RTabcfffgh=2015-3-19-8-57-39'
        }
    }
    var deferred = Q.defer();
    var req = http.request(opt, function(res) {
        //console.log("Got response: " + res.statusCode);
        //var bufferHelper = new BufferHelper();
        if (res.statusCode == 200) {
            var filename='D:\\logs\\Kaptcha.jpg'
            var ws = fs.createWriteStream(filename) ;
            res.on('data',function(chunk){
                //body += d;
                //bufferHelper.concat(chunk)
                ws.write(chunk);
            }).on('end', function(){
                //bufferHelper=bufferHelper.toBuffer()
                console.log('car_ident_image ok');
                ws.end();
                deferred.resolve(filename);
            });
        }

    }).on('error', function(e) {
        //console.log("Got error: " + e.message);
        deferred.reject(e);
    })
    req.end();
    return deferred.promise;


}

function man_input_ident(){
    var deferred = Q.defer();
    var rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    rl.question("please input image key? ", function(answer) {
        // TODO: Log the answer in a database
        //console.log("Thank you for your valuable feedback:", answer);
        deferred.resolve(answer);
        rl.close();
    });
    return deferred.promise;
}

function post_car_info(info){
    var opt =   {
        host:'www.zjsgat.gov.cn',
        port:'8080',
        method:'POST',
        path:'/was/common.do',
        headers:{ host: 'www.zjsgat.gov.cn:8080',
            connection: 'keep-alive',
            'content-length': '120',
            'cache-control': 'max-age=0',
            accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            origin: 'http://www.zjsgat.gov.cn:8080',
            'user-agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2272.89 Safari/537.36',
            'content-type': 'application/x-www-form-urlencoded',
            referer: 'http://www.zjsgat.gov.cn:8080/was/portals/car_lllegal_query.jsp',
            'accept-encoding': 'gzip',
            //'accept-encoding': 'gzip',
            'accept-language': 'zh-CN,zh;q=0.8,en;q=0.6',
            cookie: 'com.trs.idm.coSessionId=C2F11F4E246C08D55C670736A27E0CBF; JSESSIONID=607955144365DA2F21160B53B3AB92F0; connect.sid=s%3A4ERR0gfDnlbetS569r0Pg4wO6LrwpEA1.UjSpOXUReQwueB%2FayvpV8uhswSiHmQcH9GJhDyIwVks; USER_ID=1000000594; arrayid=r-gatbsdt1; __FTabcfffgh=2015-3-19-8-57-39; __NRUabcfffgh=1426726659473; __RTabcfffgh=2015-3-19-8-57-39'
        }
    }
    var data ={ tblname: 'carlllegalquery',
        flag: 'gatwsbsdt',
        carid: '浙AAK964',
        cartype: '02',
        carno: '018107',
        yzm: info.yzm,
        laozishiniyeye: 'laozishiniyeye' };
    //data.carid=iconv.encode(data.carid,'GBK').toString();
    //data = require('querystring').stringify(data);
    //opt.headers['Content-Length']=data.length;

    var deferred = Q.defer();

//
//    var optpost = {
//        url:'http://www.zjsgat.gov.cn:8080/was/common.do',
//        headers:{ host: 'www.zjsgat.gov.cn:8080',
//            connection: 'keep-alive',
//            'content-length': '120',
//            'cache-control': 'max-age=0',
//            accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
//            origin: 'http://www.zjsgat.gov.cn:8080',
//            'user-agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2272.89 Safari/537.36',
//            'content-type': 'application/x-www-form-urlencoded',
//            referer: 'http://www.zjsgat.gov.cn:8080/was/portals/car_lllegal_query.jsp',
//            'accept-encoding': 'gzip, deflate',
//            'accept-language': 'zh-CN,zh;q=0.8,en;q=0.6',
//            cookie: 'com.trs.idm.coSessionId=C2F11F4E246C08D55C670736A27E0CBF; JSESSIONID=607955144365DA2F21160B53B3AB92F0; connect.sid=s%3A4ERR0gfDnlbetS569r0Pg4wO6LrwpEA1.UjSpOXUReQwueB%2FayvpV8uhswSiHmQcH9GJhDyIwVks; USER_ID=1000000594; arrayid=r-gatbsdt1; __FTabcfffgh=2015-3-19-8-57-39; __NRUabcfffgh=1426726659473; __RTabcfffgh=2015-3-19-8-57-39'
//        }
//    }
//
//
//    optpost.form={ tblname: 'carlllegalquery',
//        flag: 'gatwsbsdt',
//        carid: '浙AAK964',
//        cartype: '02',
//        carno: '018107',
//        yzm: info.yzm,
//        laozishiniyeye: 'laozishiniyeye' };
//    request.post(optpost,function(error,response,body){
//        if (!error && response.statusCode == 200) {
//            console.log(iconv.decode(body, 'gb2312').toString());
//            deferred.resolve("");
//        }else{
//            deferred.reject('eeeeeeeeeeerrrrr')
//        }
//    });
//





    var req = http.request(opt, function(res) {
        console.log("Got response: " + res.statusCode);
        console.log(res.headers);
        if (res.statusCode == 200) {
            //res.setEncoding('utf-8');
            var bufferHelper = new BufferHelper();
            res.on('data',function(chunk){
                bufferHelper.concat(chunk);
                //console.log(chunk.isBuffer)
                //console.log(chunk)
            }).on('end', function(){
                var html = iconv.decode( bufferHelper.toBuffer(), 'GBK' );
                console.log('post_car_info ok');
                //console.log(html.toString('UCS2'));
                console.log(html);
                deferred.resolve(html);
            });
        }

    }).on('error', function(e) {
        console.log("Got error: " + e.message);
        deferred.reject(e);
    })
    req.write(data + "\n");
    req.end();


    return deferred.promise;

}



function getCookie(){
    var opt = {
        host:'www.zjsgat.gov.cn',
        port:'8080',
        method:'GET',
        path:'/was/portals/getCookie.jsp',
        headers: { host: 'www.zjsgat.gov.cn:8080',
            connection: 'keep-alive',
            'cache-control': 'max-age=0',
            accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'user-agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2272.89 Safari/537.36',
            'accept-encoding': 'gzip',
            'accept-language': 'zh-CN,zh;q=0.8,en;q=0.6'
            , cookie: 'com.trs.idm.coSessionId=C2F11F4E246C08D55C670736A27E0CBF; JSESSIONID=607955144365DA2F21160B53B3AB92F0; arrayid=r-gatbsdt2; __FTabcfffgh=2015-3-20-8-0-33; __NRUabcfffgh=1426809633814; __RTabcfffgh=2015-3-20-8-0-33'
        }
    }
    //var body = '';
    var deferred = Q.defer();
    request('http://www.zjsgat.gov.cn:8080/was/portals/getCookie.jsp', function (error, response, body) {
        if (!error && response.statusCode == 200) {
            console.log(body) // Show the HTML for the Google homepage.
        }
        console.log(error);
    })
    return deferred.promise;
}



getCookie().then(function(d){
    console.log(d);
})
//phantomjs可以模拟登录
//9087
//http://www.jb51.net/article/43328.htm

/*
car_lllegal_query().then(function(html){
    console.log( '------html ok' );
    console.log( html );
    return  car_ident_image();
}).then(function(img){
    console.log(img);
    return man_input_ident();
}).then(function(identkey){
    console.log(identkey);
    return post_car_info({yzm:identkey});

}).done(function(){

},function(err){
    console.log(err);
})*/

//http://bbs.nju.edu.cn/bbstop10
//http://bbs.nju.edu.cn/bbstcon?board=S_Information&file=M.1367076046.A
/*
var optttt =   {
    host:'bbs.nju.edu.cn',
    method:'GET',
    path:'/bbstcon?board=S_Information&file=M.1367076046.A'
}
var req = http.request(optttt, function (res) {
    console.log(res.statusCode);
    var bufferHelper = new BufferHelper();
    if (res.statusCode == 200) {
        var body = "";
        res.on('data', function (data) {
            bufferHelper.concat(data);
        }).on('end', function () {
                var html = iconv.decode( bufferHelper.toBuffer(), 'GBK' );
                console.log(html);
        })
    }

}).on('error', function(e) {
    console.log("Got error: " + e.message);
});
req.end();
*/

/*
* var req = http.request(opt, function (serverFeedback) {
 if (serverFeedback.statusCode == 200) {
 var body = "";
 serverFeedback.on('data', function (data) { body += data; })
 .on('end', function () { res.send(200, body); });
 }
 else {
 res.send(500, "error");
 }
 });
 req.write(data + "\n");
 req.end();
 }
* */