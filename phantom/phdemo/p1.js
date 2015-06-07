/**
 * Created by Administrator on 2015/4/29.
 */
page.open(address, function (status) {
    if (status !== 'success') {
        console.log('Unable to load the address!');
        phantom.exit();
    } else {
        page.onPageCreated = function(newPage){
            newPage.onLoadFinished = function(){
                console.log(newPage.url);
                phantom.exit();
            };
        };
        page.evaluate(function(url){
            window.open(url+"?something=other", "_blank");
        }, address);
    }
})

var page = require('webpage').create();
var address = "http://example.com/";

function waitFor(testFx, onReady, timeOutMillis) {
    var maxtimeOutMillis = timeOutMillis ? timeOutMillis : 3000, //< Default Max Timout is 3s
        start = new Date().getTime(),
        condition = false,
        interval = setInterval(function() {
            if ( (new Date().getTime() - start < maxtimeOutMillis) && !condition ) {
                // If not time-out yet and condition not yet fulfilled
                condition = (typeof(testFx) === "string" ? eval(testFx) : testFx()); //< defensive code
            } else {
                if(!condition) {
                    // If condition still not fulfilled (timeout but condition is 'false')
                    console.log("'waitFor()' timeout");
                    phantom.exit(1);
                } else {
                    // Condition fulfilled (timeout and/or condition is 'true')
                    console.log("'waitFor()' finished in " + (new Date().getTime() - start) + "ms.");
                    typeof(onReady) === "string" ? eval(onReady) : onReady(); //< Do what it's supposed to do once the condition is fulfilled
                    clearInterval(interval); //< Stop this interval
                }
            }
        }, 50); //< repeat check every 50ms
};

page.open(address, function (status) {
    if (status !== 'success') {
        console.log('Unable to load the address!');
        phantom.exit();
    } else {
        console.log("p:", page.ownsPages, typeof page.pages, page.pages.length, page.pages);
        waitFor(function test(){
            return page.pages && page.pages[0];
        }, function ready(){
            page.pages[0].onLoadFinished = function(){
                console.log("p:", page.ownsPages, typeof page.pages, page.pages.length, page.pages);
                console.log("inner:", page.pages[0].url);
                phantom.exit();
            };
        });
        page.evaluate(function(url){
            window.open(url+"?something=other", "_blank");
        }, address);
    }
})



page.onInitialized = function(){
    page.evaluate(function(){
        var _oldOpen = window.open;
        window.open = function(url, type){
            _oldOpen.call(window, url, type);
            window.callPhantom({type: "open"});
        };
    });
};
page.onCallback = function(data){
    // a little delay might be necessary
    if (data.type === "open" && page.pages.length > 0) {
        var newPage = page.pages[page.pages.length-1];
        newPage.onLoadFinished = function(){
            console.log(newPage.url);
            phantom.exit();
        };
    }
};
page.open(address, function (status) {
    if (status !== 'success') {
        console.log('Unable to load the address!');
        phantom.exit();
    } else {
        page.evaluate(function(url){
            window.open(url+"?something=other", "_blank");
        }, address);
    }
})