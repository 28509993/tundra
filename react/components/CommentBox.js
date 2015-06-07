/**
 * Created by Administrator on 2015/5/27.
 */
var React = require('react');

var data = [
    {author: "Pete Hunt", text: "This is one comment"},
    {author: "Jordan Walke", text: "This is *another* comment"}
];
var names = ['Alice', 'Emily', 'Kate'];
var CommentBox=React.createClass({
    getInitialState:function(){
        return {data:[]}
    },
    onCommentSubmit:function(comment){
        data.push(comment)
        var self=this;
        setTimeout(function(){
            self.setState({data: data});
        },2000)

    },
    componentDidMount:function(){
        var self=this;
        setTimeout(function(){
            self.setState({data: data});
        },2000)
    },
    render:function(){
        return (<div className="commentBox">
            <h1>Comments</h1>
            <CommentList data={this.state.data} />
            <CommentForm onCommentSubmit={this.onCommentSubmit} />
        </div>)
    }
})


var converter = new Showdown.converter();
var Comment = React.createClass({
    render: function() {

        // 通过this.props.children访问元素的子元素
        var rawHtml = converter.makeHtml(this.props.children.toString());
        return (
            // 通过this.props访问元素的属性
            // 不转义，直接插入纯HTML
            <div className="comment">
                <h2 className="commentAuthor">{this.props.author}</h2>
                <span dangerouslySetInnerHTML={{__html: rawHtml}} />
            </div>
            );
    }
});

var CommentList = React.createClass({
    render: function() {
        var commentNodes = this.props.data.map(function(comment) {
            return (
                <Comment author={comment.author}>
							{comment.text}
                </Comment>
                );
        });
        var commentNames = names.map(function(name) {
            return (<div>Hello, {name}!</div>)
        });
        return (
            <div className="commentList">
						{commentNodes}
                       test aa {commentNames}
            </div>
            );
    }
});

var CommentForm = React.createClass({
    handleSubmit: function(e) {
        e.preventDefault();
        // e.returnValue = false;
        var author = this.refs.author.getDOMNode().value.trim();
        var text = this.refs.text.getDOMNode().value.trim();

        if(!text || !author) return;

        this.props.onCommentSubmit({author: author, text: text});

        // 获取原生DOM元素
        this.refs.author.getDOMNode().value = '';
        this.refs.text.getDOMNode().value = '';
    },
    render: function() {
        return (
            // 为元素添加submit事件处理程序
            // 用ref为子组件命名，并可以在this.refs中引用
            <form className="commentForm" onSubmit={this.handleSubmit}>
                <input type="text" placeholder="Your name" ref="author"/>
                <input type="text" placeholder="Say something..." ref="text"/>
                <input type="submit" value="Post"/>
            </form>
            );
    }
});

exports=module.exports = CommentBox