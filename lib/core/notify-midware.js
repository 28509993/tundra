/**
 * Created by Administrator on 2015/4/23.
 */

exports=module.exports=function(options,url,messages) {
    var socketIOClient = require('socket.io-client')
    var midClient;
    var wsoptions = {
        'forceNew': true,
        reconnection: true,
        'reconnectionDelay': 500};
        if (!messages || messages.length <= 0) return;
        function emitMsg() {
            messages.forEach(function (msg) {
                midClient.emit(msg.event, msg.data)
            })
        }

        //setTimeout(function () {
           // if (midClient) return;
            midClient = socketIOClient.connect(url, wsoptions);
            midClient.on('connect', function () {
                emitMsg(messages);
            })
        //}, 1000);
        setInterval(function () {
            emitMsg(messages);
        }, 5000);
    return midClient;
    /*
     midClient = socketIOClient.connect(options['midware'] + '/taskroom', wsoptions);
    notifyMidware([
        {event: "registXTasker", data: {port: options.taskPort + ''}}
    ]);*/
}