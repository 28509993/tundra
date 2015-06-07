/**
 * Created by Administrator on 2015/3/21.
 */

$(document).ready(function(){
    var socket = io.connect('ws://localhost:3109');



    socket.on('connection', function (data) {
        //{icc:'2355666',value:'1122'}
        console.log('111111111111')

    });
    socket.on('receive icc', function (data) {
        //{icc:'2355666',value:'1122'}
        console.log(data)
    });

    $("#testbt").click(function(){
        //for test
        socket.emit('simulate', {icc:'2355666',value:'1122'});

    });

});


