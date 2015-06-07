/**
 * Created by Administrator on 2015/3/20.
 *  must be gbk  如果是乱码必须是ansi的gbk
 */
window.displayProgressBar=function(){};
window.displayZjsgatWindow=function(){};
window.injectedPickupWeb=function () {
    var context = $(".con_border").text()
    var matchs = context.match(/共有([\s0-9]+)条违法记录([\s\S]+$)/i);
    if (!matchs)  return $phph$('status').fn('failure');
    context = matchs[2];
    var cm_tickets = [];
    var status = 'failure'
    if ((/对不起，由于未知原因，查询出现异常，请重新查询/i).test(context)) {
        status = 'failure'
    } else if ((/车辆没有查询到非现场违法记录/i).test(context)) {
        //浙BD792X 车辆没有查询到非现场违法记录！（请核对输入的“车辆识别号”是否正确
        $phph$('task').fn({cm_tickets: cm_tickets});
        status = 'success'
    } else if ((/违法地址/i).test(context)) {
        var recs = context.replace(/记录[\s\d]+/gi, '||||').split('||||')
        for (var i = 1, n = recs.length; i < n; i++) {
            var fields =  $phph$('#').trim(recs[i]).match(/车牌号码：([\s\S]*)车辆种类：([\s\S]*)违法地址：([\s\S]*)违法行为：([\s\S]*)违法时间：([\s\S]*)处理标记：([\s\S]*)交款标记：([\s\S]*)采集机关：([\s\S]*)/);
            for (var k = 1, m = fields.length; k < m; k++) {
                fields[k] =  $phph$('#').trim(fields[k]);
            }
            var cm_ticket = {
                carMark: fields[1],
                carKind: fields[2],
                illegalAddress: fields[3],
                illegalEvent: fields[4],
                illegalTime: fields[5],
                dealFlag: fields[6],
                paidFlag: fields[7],
                gatherDepart: fields[8]
            }
            cm_tickets.push(cm_ticket);
        }
        $phph$('task').fn({cm_tickets: cm_tickets});
        status = 'success'
    }
    $phph$('status').fn(status);
}
window.injectedOverIleageAction=function (){
    var originRand=window.rand;
    var count=5;
    var task=$phph$('task').fn();
    var options= $phph$('taskOptions').fn()
    window.rand=function (){
        count--;
        if (count<=0) return $phph$('status').fn('failure');
        var img = new Image ();
        img.src ="../Kaptcha.jpg?"+Math.floor(Math.random()*100);
        var ttout= setTimeout(function(){
            window.rand();
        } ,10000);
        img.onload =function() {
            ttout&&clearTimeout(ttout);
            ttout=null;
            var data =$phph$('#').imageBase64(img);
            document.getElementById("kaptchaImage").src= data;
            validateImg.call(null,data,function(err,rst){
                if (err) return window.rand();
                $("#yzm").val(rst.value.toUpperCase());
                $phph$('status').fn('ignored');
                window.submitform();
            });
        }
    };
    var originSubmitform= window.submitform;
    window.submitform=function (){
        var yzm= $("#yzm").val();
        $("#yzm").val(yzm.toUpperCase());
        $phph$('status').fn('ignored');
        if (/[A-Z0-9]{4}/.test(yzm)){
            originSubmitform.apply(null,arguments)
        }
        if (window.checkrand&&window.checkrand.result){
            $phph$('status').fn('waiting');
        }else{
            setTimeout(function(){window.rand()},1000)
        }
    }

    function validateImg(data,fn) {
        var seq=$phph$('#').hash(data);
        var count=25;
        function getImgValue(){
            count--;
            if (count<=0) return  fn(new Error());
            var url = options['midware'] + '/getImgValue?seq=' +seq ;
            $phph$('ajax').fn(url, {method: 'get', dataType: 'json'}, function (err, rst) {
                if (err||!rst||!rst.value) return setTimeout(function(){     getImgValue.call(null);     } ,2000);
                fn(null,rst);
            });
        };
        var url =options['validateImgware'] + '/validateImg?seq=' +seq + '&oldseq=' + task.seq;
        $phph$('ajax').fn(url, {method: 'post', data: data}, function (err, rst) {
            if (err) return setTimeout(function(){      fn(new Error());    } ,5000);
            getImgValue.call(null);
        });
    }

}

window.injectedRun=function() {
    var url = window.location.pathname;
    var isPhantom = typeof window.callPhantom === "function";
    function initialize() {
        $("#usertab").hide();
        $("[href='/was/portals/index.jsp']").parent().parent().hide();
        $("td.top_resturn").parent().parent().parent().hide();
        $("#page").parent().parent().hide();
        $("#gatweixindiv").hide();
    }

    var runner = {};
    ;!function (isUrl) {
        if (!isUrl) return;
        runner.waitFor = function () {
            return $('[name="submitaasaa"]').is(':visible')
        };
        runner.work = function () {
            initialize();
            $("#carid").attr("onkeyup", "")
            $("#carid").attr("onfocus", "");
            ;!function () {
                if (!isPhantom) {
                    var data={"seq":"23232","carMark":"浙BD792X","carIdent": "065026","carKind": "02","busiType":"illegal"};
                    $("#carid").val(data.carMark);
                    $("#carno").val(data.carIdent);
                    $("#cartype").val(data.carKind);
                    window.rand();
                    return ;
                }
                window.injectedOverIleageAction();
                var task = $phph$('task').fn();
                $("#carid").val(task.carMark.toUpperCase());
                $("#carno").val(task.carIdent);
                $("#cartype").val(task.carKind);
                $phph$('status').fn('ready');
                window.rand();
            }();
        };
        runner.failure = undefined;
    }(url === '/was/portals/car_lllegal_query.jsp');
//---------------------------------------------------------------
    ;!function (isUrl) {
        if (!isUrl) return;
        runner.waitFor = function () {
            return true;
        };
        runner.work = function () {
            initialize();
            ;!function () {
                if (!isPhantom) return;
                $phph$('status').fn('ignored');
                window.injectedPickupWeb();
            }();
        };
        runner.failure = undefined;
    }(url === '/was/common.do');
    runner=runner.work?runner:undefined;
    return runner;
}

typeof window.callPhantom === "function" || $(document).ready(window.injectedRun().work);
window.injectedMain=function() {
    $phph$('mytestfunc').fn('$phph$---------- mytest-data=='+window.location.pathname);
    var runner=window.injectedRun();
    runner&&$phph$('#').waitFor(runner.waitFor, runner.work, 5000,runner.failure|| " $phph$('status').fn('failure');");
    return true;
}

//document.charset document.characterSet


