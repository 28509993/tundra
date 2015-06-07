/**
 * Created by Administrator on 2015/4/7.
 */
var net = require('net'),
    http = require('http'),
    url = require('url'),
    fs = require('fs');

/*
* 思路非常简单:
 httpserver获取需要还原的url；
 使用httpclient递归请求这个url，直到发现http status not in (302, 301)为止。
 返回还原的原url。
* */

var DEFAULT_PORTS = {
    'http:': 80,
    'https:': 443
};

var INDEX_TPL = fs.readFileSync('index.html');

function _write(str, res, content_type) {
    if(res.jsonp_cb) {
        str = res.jsonp_cb + '("' + str + '")';
    }
    res.writeHead(200, {
        'Content-Length': str.length,
        'Content-Type': content_type || 'text/plain'
    });
    res.end(str);
};

function expand(short_url, res) {
    var info = url.parse(short_url);
//  console.log('info: ' + JSON.stringify(info));
    if(info.protocol != 'http:') { // 无法请求https的url?
        _write(short_url, res);
        return;
    }
    var client = http.createClient(info.port
        || DEFAULT_PORTS[info.protocol], info.hostname);
    var path = info.pathname || '/';
    if(info.search) {
        path += info.search;
    }
    var headers = {
        host: info.hostname,
        'User-Agent': 'NodejsSpider/1.0'
    };
    var request = client.request('GET', path, headers);
    request.end();
    request.on('response', function (response) {
        if(response.statusCode == 302
            || response.statusCode == 301) {
            expand(response.headers.location, res);
        } else {
            _write(short_url, res);
        }
    });
};

//expand('http://sinaurl.cn/hbMUII');
// http服务
http.createServer(function(req, res){
    if(req.url.indexOf('/api?') == 0) {
        var params = url.parse(req.url, true);
        if(params.query && params.query.u) {
            if(params.query.cb) { // 支持jsonp跨域请求
                res.jsonp_cb = params.query.cb;
            }
            expand(params.query.u, res);
        } else {
            _write('', res);
        }
    } else {
        _write(INDEX_TPL, res, 'text/html');
    }
}).listen(1235);

process.on('uncaughtException', function (err) {
    console.log('Caught exception: ' + err);
});

//https://github.com/fourkitchens/train-headless/blob/161bbf501ee3f46d1005bf0c14e38d89a429314a/syllabus/03-intro-to-nodejs.md