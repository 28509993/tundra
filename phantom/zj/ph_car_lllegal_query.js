/**
 * Created by Administrator on 2015/3/20.
 */

var xurl='http://www.zjsgat.gov.cn:8080/was/portals/car_lllegal_query.jsp';
xurl='http://localhost:3102/was/portals/car_lllegal_query.jsp';
var system = require('system');
var page = require('webpage').create();
page.open(xurl, function () {
    console.log('Hello, world!');
    //page.render('example.png');
    if(status === "success") {
        //page.render('example.png');
    }
    var title = page.evaluate(function() {
        return document.title;
    });

    var ua = page.evaluate(function () {
        return document.getElementById('cartype').value ;//textContent;
    });
    var ua2 = page.evaluate(function () {
        var data= {carid:'浙BD792X',carno: '065026',cartype: '02'}
        $("#carid").val(data.carid);
        $("#carno").val(data.carno);
        $("#cartype").val(data.cartype);
        $("#carno").val("065026");
        return $("#carno").val();
    });

    var ua3 = page.evaluate(function () {
        function getRandSequence(size){
            var Num="";
            var size=size||15;
            for(var i=0;i<size;i++)
            {
                Num+=Math.floor(Math.random()*10);
            }
            return Num;
        }
        var iic=getRandSequence();
        $("#kaptchaImage").attr("src","/was/overloadIllegalQueryIdent.jpg?iic="+iic);
        return iic;
    });
    system.stdout.writeLine('imput image key: (ctrl+D to end)');
    var imgkey = system.stdin.read(4);

    var ua4 = page.evaluate(function (imgkey,b) {
        $("#yzm").val(imgkey);
        return 'img key is:'+imgkey;
    },imgkey,'b');
    console.log(ua4);
    setTimeout(function(){
        system.stdout.writeLine('wait for image key: (ctrl+D to end) 5s');
        var ua5 = page.evaluate(function () {
            $('input[name="submitaasaa"]').trigger("click")
            return 'submit!'
        });
        console.log(ua5);
        setTimeout(function(){
            system.stdout.writeLine('wait for post: (ctrl+D to end) 20s');
            page.render('example.png');
            system.stdout.writeLine('--------------end');
        },20000);
    },5000);




    //console.log('----------end');

    /*
    page.evaluate(function() {
        console.log('H2222orld!');
        //$("button").click();
        var data= {carid:'浙BD792X',carno: '065026',cartype: '02'}
        $("#carid").val(data.carid);
        $("#carno").val(data.carno);
        $("#cartype").val(data.cartype);
        page.render('example.png');
        console.log('H33333ld!');
        phantom.exit();
    });
    */

});

page.onNavigationRequested = function(url, type, willNavigate, main) {
    console.log('Trying to navigate to: ' + url);
    console.log('Caused by: ' + type);
    console.log('Will actually navigate: ' + willNavigate);
    console.log('Sent from the page\'s main frame: ' + main);
}

//http://www.tuicool.com/articles/beeMNj
//http://www.cnblogs.com/front-Thinking/p/4321720.html
//phantomjs.exe
//http://www.tuicool.com/articles/nieEVv
//git clone git://github.com/jcarver989/phantom-jasmine.git

//phantomjs.exe  ph_car_lllegal_query.js