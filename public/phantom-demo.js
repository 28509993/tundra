/**
 * Created by Administrator on 2015/4/29.
 */




function myWinCall(a,b,c){
    //return window.injectedCallPhantom('mytestfunc',4,5,6);
    $phph$('#').waitFor('window.injectTestDatea==="bbb"',function(){
        $phph$('mytestfunc').fn(31,31,31);
    },5000,"$phph$('mytestfunc').fn(40,50,60);")
    return 'myWinCallyyyy----------'+a+b+c+  $phph$('#').trim(' 1trim1 ')+'  hash='+ $phph$('#').hash('aaaaaaaaaaaabc')
}

window.injectTestDatea='aaaaa';


window.injectedAjaxDemo=function(url,options,fn){

    var url='http://localhost:60059/getXTask';
    var opts={method:'get',dataType:'json'};

    $phph$('ajax').fn(url,opts,function(err,rawtask){
        return  $phph$('mytestfunc').fn('$phph$----------'+JSON.stringify(rawtask) )
    })

    $phph$('mytestfunc').fn('$phph$----------'+JSON.stringify($phph$('task').fn({aazdddfd:'ttmmdd'} )) )


    $phph$('mytestfunc').fn('$phph$----------'+JSON.stringify($phph$('taskOptions').fn()) );
    $phph$('mytestfunc').fn('$phph$---------- mytest-data=='+$("#mytest-data").val() );



    $phph$('renderBase64').fn();

    $phph$('mytestfunc').fn('$phph$---------- imageBase64=='+typeof($phph$('#').imageBase64) );
    //window.__injectedInnerNative
    $phph$('mytestfunc').fn('$phph$---------- all func=='+ Object.keys(window.__injectedInnerNative).join() );
    return $phph$('mytestfunc').fn(44,55,66,function(a,b,c){
        $phph$('status').fn('success');
        //$phph$('status').fn('failure')
        return  $phph$('mytestfunc').fn('$phph$--------'+a+b+c,'---$phph$  end  '+ $phph$('#').hash('abc') )
    },{bbb:'aaabcc'});
}


window.injectedMain=function() {
    setTimeout(function () {
        window.injectTestDatea = 'bbb'
    }, 5500);
    $phph$('#').waitFor('window.injectTestDatea==="bbb"', function () {
        $phph$('mytestfunc').fn(41, 51, 61);
    }, 2000, "$phph$('mytestfunc').fn(40,50,60);");
    window.injectedAjaxDemo('', '', function () {
        return window.injectTestDatea = 'ccc'
    })
}


