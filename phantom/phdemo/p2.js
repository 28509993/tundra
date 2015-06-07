/**
 * Created by Administrator on 2015/5/1.
 */
/**
 * Created by Administrator on 2015/4/29.
 */




function myWinCall(a,b,c){

    //return window.injectedCallPhantom('mytestfunc',4,5,6);
    $phph$('#').waitFor('window.injectTestDatea==="bbb"',function(){
        window.injectedCallPhantom('mytestfunc',41,51,61);
    },5000,"window.injectedCallPhantom('mytestfunc',40,50,60);")
    return 'myWinCallyyyy----------'+a+b+c+  $phph$('#').trim(' 1trim1 ')+'  hash='+ $phph$('#').hash('aaaaaaaaaaaabc')
}

window.injectTestDatea='aaaaa';


window.injectedAjax=function(url,options,fn){
    //return window.injectedCallPhantom('mytestfunc',40,50,60,callbackid,{bbb:'aaabcc'});
    return $phph$('mytestfunc').fn(44,55,66,function(a,b,c){
        $phph$('injectedStatus').fn('success')
        return  $phph$('mytestfunc').fn('$phph$--------'+a+b+c,'---$phph$  end  '+ $phph$('#').hash('abc') )
    },{bbb:'aaabcc'})
    //return window.injectedCallPhantom('mytestfunc',url,options,callbackid);
    //return window.injectedInnerFnMap[callbackid].call()
    //return JSON.stringify( Object.keys( window.injectedInnerFnMap));
}


window.injectedMain=function(){
    setTimeout(function(){
        window.injectTestDatea='bbb'
    },2500);

    $phph$('#').waitFor('window.injectTestDatea==="bbb"',function(){
        //window.injectedCallPhantom('mytestfunc',41,51,61);
        $phph$('mytestfunc').fn(41,51,61);
    },2000,"$phph$('mytestfunc').fn(40,50,60);")
//  window.injectedCallPhantom('mytestfunc',40,50,60);
    window.injectedAjax('','',function(){
        return window.injectTestDatea='ccc'
    })
}