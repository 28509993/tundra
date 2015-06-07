/**
 * Created by Administrator on 2015/3/20.
 */
function remainTime(){
    var time = 3;
    var i = setInterval(function(){
        if(time > 0 ){
            time--;
            document.getElementById('remainTime').innerText = time;

        }else{
            clearInterval(i);
            removeZjsgatWindow();
        }
    },1000);
}

window.displayProgressBar=function(){};
window.displayZjsgatWindow=function(){};

function rand(){
    $("#injected-result").val('');
    var img = new Image ();
    img.src ="../Kaptcha.jpg?"+Math.floor(Math.random()*100);
    img.onload =function() {
        //var data = injectedtBase64Image(img);
        //$("#injected-result").val(data);
        //document.getElementById("kaptchaImage").src= data;
    }
}
//above is overload

function injectedtBase64Image(img) {
    var canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    var ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, img.width, img.height);
    var dataURL = canvas.toDataURL("image/png");
    //var dataURL = canvas.toDataURL("image/jpg");
    return dataURL
    // return dataURL.replace("data:image/png;base64,", "");
}

function injected_car_lllegal_query() {
    $("td.t_title") .append('<input type="text"  id="inject_input_msg" name="inject_input_msg"/>'
        +' <input type="button" name="inject_input_submit"  id="inject_input_submit" onclick="do_car_lllegal_query_submit();" value="submitinfo" />')
    //remove
    $("#usertab").hide();
    $("[href='/was/portals/index.jsp']").parent().parent().hide();
    $("td.top_resturn").parent().parent().parent().hide();
    $("#gatweixindiv").hide();
    $("div.ue-survey").parent().parent().parent().hide();
    setTimeout("do_car_lllegal_query()", 1000);
}

function injected_car_lllegal_common() {
    var outcome={}

    console.log($("td.con_border").text());


}

$(document).ready(function(){
    var url= window.location.pathname;
    '/was/portals/car_lllegal_query.jsp'===url&&injected_car_lllegal_query()
    '/was/common.do'===url&&injected_car_lllegal_common()
    injected_car_lllegal_common();
});

function do_car_lllegal_query_submit(){
    $("#yzm").val( $("#inject_input_msg").val());
    $('input[name="submitaasaa"]').trigger("click")
    //$('#searchformaaaa').submit()
    //submitform();
}


function do_car_lllegal_query(){
    $.ajax
    ({  type: "get",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        url: '/car/nextquerytask',
        success: function (data) {
            $("#carid").val(data.carid);
            $("#carno").val(data.carno);
            $("#cartype").val(data.cartype);
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            console.log('eeeeeeeeeee');
        }
    });
}



/*
 var iic_car_illegal;
 var iic_socketoptions= {
 'force new connection': true,
 reconnect: true,
 'reconnection delay': 500
 };
 var socket_car_lllegal =io.connect("ws://localhost:3109/iic",iic_socketoptions);
 socket_car_lllegal.on('iic_from_out', function (data) {
 console.log(data)
 if (data.key&&data.key.indexOf(iic_car_illegal)>=0&&data.password&&data.password.length===4){
 $("#yzm").val( data.password);
 $('input[name="submitaasaa"]').trigger("click");
 }
 });*/
