/**
 * Created by Administrator on 2015/3/22.
 */
var  log4js = require('log4js');

exports=module.exports=function (name){
    var logger = log4js.getLogger(name||'normal');
    //logger.setLevel('INFO');
    return logger;
}

exports.init=function(options){
    if (!options) return ;
    log4jsConfigured={appenders:options, replaceConsole: false};
    log4js.configure(log4jsConfigured);
}



/*
;!function (){
    var log4jsConfigured;
    var options;
    function inti(){
        if (log4jsConfigured) return ;
        log4jsConfigured=$global['log4js'];
        options={appenders:log4jsConfigured, replaceConsole: false};
        log4jsConfigured&&log4js.configure(options);
    }
    function getLogger(name){
        inti();
        var logger = log4js.getLogger(name||'normal');
        //logger.setLevel('INFO');
        return logger;
    }
    getLogger.use=function (){
        return log4js.connectLogger(getLogger('access'), {level:'trace', format:':method :url :status'});
    }
    exports=module.exports=getLogger
}();*/