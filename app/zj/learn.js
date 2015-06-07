/**
 * Created by Administrator on 2015/4/13.
 */

function addURLParam(url, name, value) {
    url += (url.indexOf("?") == -1 ? "?" : "&");
    url += encodeURIComponent(name) + "=" + encodeURIComponent(value);
    return url;
}

function getQueryString(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return unescape(r[2]); return null;
}

function getURLParam(name) {
    var value = location.search.match(new RegExp("[?&]" + name + "=([^&]*)(&?)","i"));
    return value ? decodeURIComponent(value[1]) : value;
}
