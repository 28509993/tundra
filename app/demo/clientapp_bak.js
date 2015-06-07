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

var optquery = {
    url: 'http://www.zjsgat.gov.cn:8080/was/portals/car_lllegal_query.jsp',
    headers: { host: 'localhost:3102',
        connection: 'keep-alive',
        'cache-control': 'max-age=0',
        accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'user-agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2272.89 Safari/537.36',
        'accept-encoding': 'gzip, deflate, sdch',
        'accept-language': 'zh-CN,zh;q=0.8,en;q=0.6',
        cookie: 'com.trs.idm.coSessionId=9166849D08FCC34F6F209879ADCEB405; JSESSIONID=C39EC47593D992B748F511B41B073856; connect.sid=s%3A4ERR0gfDnlbetS569r0Pg4wO6LrwpEA1.UjSpOXUReQwueB%2FayvpV8uhswSiHmQcH9GJhDyIwVks; USER_ID=1000000594; arrayid=r-gatbsdt1; __FTabcfffgh=2015-3-19-8-57-39; __NRUabcfffgh=1426726659473; __RTabcfffgh=2015-3-19-8-57-39'
    }

};






var imgurl="http://www.zjsgat.gov.cn:8080/was/Kaptcha.jpg?"+Math.floor(Math.random()*100);
var optimg =   {
    url:imgurl,
    headers:{ host: 'www.zjsgat.gov.cn:8080',
        connection: 'keep-alive',
        accept: 'image/webp,*/*;q=0.8',
        'user-agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2272.89 Safari/537.36',
        referer: 'http://www.zjsgat.gov.cn:8080/was/portals/car_lllegal_query.jsp',
        'accept-encoding': 'gzip, deflate, sdch',
        'accept-language': 'zh-CN,zh;q=0.8,en;q=0.6',
        cookie: 'com.trs.idm.coSessionId=9166849D08FCC34F6F209879ADCEB405; JSESSIONID=C39EC47593D992B748F511B41B073856; connect.sid=s%3A4ERR0gfDnlbetS569r0Pg4wO6LrwpEA1.UjSpOXUReQwueB%2FayvpV8uhswSiHmQcH9GJhDyIwVks; USER_ID=1000000594; arrayid=r-gatbsdt1; __FTabcfffgh=2015-3-19-8-57-39; __NRUabcfffgh=1426726659473; __RTabcfffgh=2015-3-19-8-57-39'
    }
}




var optpost = {
    url:'http://www.zjsgat.gov.cn:8080/was/common.do',
    headers:{ host: 'www.zjsgat.gov.cn:8080',
        connection: 'keep-alive',
        'content-length': '120',
        'cache-control': 'max-age=0',
        accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        origin: 'http://www.zjsgat.gov.cn:8080',
        'user-agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2272.89 Safari/537.36',
        'content-type': 'application/x-www-form-urlencoded',
        referer: 'http://www.zjsgat.gov.cn:8080/was/portals/car_lllegal_query.jsp',
        'accept-encoding': 'gzip, deflate',
        'accept-language': 'zh-CN,zh;q=0.8,en;q=0.6',
        cookie: 'com.trs.idm.coSessionId=9166849D08FCC34F6F209879ADCEB405; JSESSIONID=C39EC47593D992B748F511B41B073856; connect.sid=s%3A4ERR0gfDnlbetS569r0Pg4wO6LrwpEA1.UjSpOXUReQwueB%2FayvpV8uhswSiHmQcH9GJhDyIwVks; USER_ID=1000000594; arrayid=r-gatbsdt1; __FTabcfffgh=2015-3-19-8-57-39; __NRUabcfffgh=1426726659473; __RTabcfffgh=2015-3-19-8-57-39'
    }
}






function callbackImg(error, response, body) {
    console.log(error+'img ok!');
    if (!error && response.statusCode == 200) {
        var stimg = fs.createWriteStream('D:\\logs\\Kaptcha.jpg');
        stimg.write(body);
        setTimeout(function () {
            stimg.end();
        }, 100);
        //console.log(response)

    } else {

    }
}



function callbackpost(error, response, body) {
    console.log(error+'post ok');
    //console.log(response);
    if (!error && response.statusCode == 200) {
        var file = "D:\\logs\\kazd.txt";
        var str;
        //str = iconv.decode(body, 'gbk');
        //str=iconv.encode(body, 'gbk')
        //console.log(str);
        Object.prototype.toString.call()
        fs.appendFile(file, body, function(err){
            console.log(err);
        });
        //var buffer = new Readable;
        //buffer.push(body);
        //buffer.push(null);

        //var gunzipStream = zlib.createGunzip();
        //var toWrite = fs.createWriteStream('D:\\logs\\utqq.html');
        //buffer.pipe(gunzipStream).pipe(toWrite);
        /*
        var gbktxt = fs.createWriteStream('D:\\logs\\kazd.txt');
        gbktxt.write(body);
        setTimeout(function () {
            gbktxt.end();
            //toWrite.end();
        }, 100);*/
    } else {

    }
}


function postinfo(){
    var rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    rl.question("please input image key? ", function(answer) {
        // TODO: Log the answer in a database
        console.log("Thank you for your valuable feedback:", answer);
        rl.close();
        optpost.form={ tblname: 'carlllegalquery',
            flag: 'gatwsbsdt',
            carid: '浙AAK964',
            cartype: '02',
            carno: '018107',
            yzm: 'SDHX',
            laozishiniyeye: 'laozishiniyeye' };
        optpost.form.yzm=answer;
        request.post(optpost,callbackpost);
        //request.post(optpost)
         //   .on('response',function(response) {
          //      response.pipe(zlib.createGunzip()).pipe('d:\\logs\\utqq.html');
          //  })


         //.pipe(fs.createWriteStream('doodle.png'))

        //var gunzipStream = zlib.createGunzip();
        //request.post(optpost).pipe(gunzipStream);

        //fs.createReadStream('file.json').pipe(request.put('http://mysite.com/obj.json'))

    });

}



 function callbackquery(error, response, body) {
     console.log(error+'query ok!');
     if (!error && response.statusCode == 200) {
         var ws = fs.createWriteStream('D:\\logs\\Kaptcha.jpg');
         request(optimg).on('end',function(){
             postinfo();
         }) .pipe(ws);


     } else {

     }
 }

//request(optquery, callbackquery);


var optquery21 = {
    url: 'http://www.zjsgat.gov.cn:8080/was/portals/car_lllegal_query.jsp',
    headers: { host: 'www.zjsgat.gov.cn:8080',
        connection: 'keep-alive',
        'cache-control': 'max-age=0',
        accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'user-agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2272.89 Safari/537.36',
        'accept-encoding': 'gzip, deflate, sdch',
        'accept-language': 'zh-CN,zh;q=0.8,en;q=0.6'
       , cookie: 'com.trs.idm.coSessionId=6B05AC3A70E45D6D9B9E2F47D3E739F2; JSESSIONID=6B05AC3A70E45D6D9B9E2F47D3E739F2; connect.sid=s%3A4ERR0gfDnlbetS569r0Pg4wO6LrwpEA1.UjSpOXUReQwueB%2FayvpV8uhswSiHmQcH9GJhDyIwVks; USER_ID=1000000594; arrayid=r-gatbsdt1; __FTabcfffgh=2015-3-19-8-57-39; __NRUabcfffgh=1426726659473; __RTabcfffgh=2015-3-19-8-57-39'
    }

};

function getCooki(){
    var cooki= 'com.trs.idm.coSessionId=%s; JSESSIONID=%s; connect.sid=s%3A4ERR0gfDnlbetS569r0Pg4wO6LrwpEA1.UjSpOXUReQwueB%2FayvpV8uhswSiHmQcH9GJhDyIwVks; arrayid=r-gatbsdt1; __FTabcfffgh=2015-3-19-8-57-39; __NRUabcfffgh=1426726659473; __RTabcfffgh=2015-3-19-8-57-39'
    cooki=util.format(cooki,'DF399C266E38436DE25BBBE36D8C64C1');
    return cooki;
}


function car_lllegal_query(){
    var url='/was/portals/car_lllegal_query.jsp';
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
            'accept-encoding': 'gzip, deflate, sdch',
            'accept-language': 'zh-CN,zh;q=0.8,en;q=0.6',
            cookie: 'com.trs.idm.coSessionId=7F9F514537528E7383617130693D3D72; JSESSIONID=85C0DA67964C97DC343349864D949688; arrayid=r-gatbsdt2; __FTabcfffgh=2015-3-20-8-0-33; __NRUabcfffgh=1426809633814; __RTabcfffgh=2015-3-20-8-0-33' }
    }
    var req = http.request(opt, function(res) {
        console.log("Got response: " + res.statusCode);
        var bufferHelper = new BufferHelper();
        res.on('data',function(chunk){
            bufferHelper.concat(chunk);
        }).on('end', function(){
            var html = iconv.decode( bufferHelper.toBuffer(), 'GBK' );
            console.log(html);
        });
    }).on('error', function(e) {
        console.log(e);
    })
    console.log('1111111111111');
}


car_lllegal_query() ;

console.log('Server runing ');

