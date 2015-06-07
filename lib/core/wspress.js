/**
 * Created by Administrator on 2015/3/23.
 */

exports=module.exports=function (io,pathname,room){
    return new wspress(io,pathname,room);
}

function wspress(io,pathname,room){
    this.io=io;
    this.pathname=pathname;
    this.room=room||pathname;
    this.events=[];
}

wspress.prototype.use=function(event,fn){
    var self=this;
    if (!event||!fn) return self;
    self.events.push({event:event,fn:fn});
    //add agian
    var bio=self.pathname?self.io.of(self.pathname):self.io;
    bio.removeAllListeners('connection');
    bio.on('connection', function(socket){
        console.log('connected ...........')

        self.room&&socket.join(self.room);
        for (var i= 0,n=self.events.length;i<n;i++){
            var item=self.events[i];
            ;!function(event,fn){
                socket.on(event, function(data){
                    fn.call(self,self.io,socket,data);
                })
            }(item.event,item.fn);
        }
    })
    return self;
}




