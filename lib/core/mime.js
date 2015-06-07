exports.types = {
    "css": "text/css",
    "gif": "image/gif",
    "html": "text/html",
    "ico": "image/x-icon",
    "jpeg": "image/jpeg",
    "jpg": "image/jpeg",
    "js": "application/javascript", //text
    "json": "application/json",
    "pdf": "application/pdf",
    "png": "image/png",
    "svg": "image/svg+xml",
    "swf": "application/x-shockwave-flash",
    "tiff": "image/tiff",
    "txt": "text/plain",
    "wav": "audio/x-wav",
    "wma": "audio/x-ms-wma",
    "wmv": "video/x-ms-wmv",
    "xml": "text/xml"
};
/*exports.match = /.(html|gif|png|jpg|js|css)$/ig;
exports.tpl = {
    match: /css|txt|js|html/ig
};
exports.compress = {
    match: /css|js|html/ig
};*/

exports.expires ={
    maxAge:60*60*24*365
};


exports.isWebFile= function (str){
    var reg=/^[\S]+.(html|gif|png|jpg|js|css)$/ig;
    var res;
    return  (res = reg.exec(str)) && res[1];
}



exports.isCompress= function (str){
    var reg=/^[\S]+.(html|js|css)$/ig;
    var res;
    return  (res = reg.exec(str)) && res[1];
}



exports.isTemplate= function (str){
    var reg=/^[\S]+.(html|js|txt|css)$/ig;
    var res;
    return  (res = reg.exec(str)) && res[1];
}

exports.isFile= function (str){
    var reg = /^[^\\/:*?""<>|,]{1,128}$/g;
    return reg.test(str);
}

exports.isUrlPath= function (str){
    var reg = /^(\/[0-9a-zA-Z_!~*'().;?:@&=+$,%#-]*)+$/;
    return reg.test(str);
}

// fileMatch: /^(gif|png|jpg|js|css)$/ig,
/*
* var ext = path.extname(realPath);
 ext = ext ? ext.slice(1) : 'unknown';
*var ext = path.extname(realPath);

 ext = ext ? ext.slice(1) : 'unknown';

 var contentType = mime[ext] || "text/plain";

 response.writeHead(200, {'Content-Type': contentType});

 response.write(file, "binary");

 response.end();

 对于以上的静态文件服务器，Node给的响应头是十分简单的：

 Connection: keep-alive

 Content-Type: text/html

 Transfer-Encoding:  chunked

 exports.Expires = {

 fileMatch: /^(gif|png|jpg|js|css)$/ig,

 maxAge: 606024365

 };

 ar ext = path.extname(realPath);

 ext = ext ? ext.slice(1) : 'unknown';



 if (ext.match(config.Expires.fileMatch)) {

 var expires = new Date();

 expires.setTime(expires.getTime() + config.Expires.maxAge  1000);

 response.setHeader("Expires", expires.toUTCString());

 response.setHeader("Cache-Control", "max-age=" + config.Expires.maxAge);

 }

* */