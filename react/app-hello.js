var React = require('react');

var HelloReact = require('./components/HelloReact');
var CommentBox = require('./components/CommentBox');

React.render(
  <HelloReact/>,
  document.getElementById('app')
);

React.render(
    <CommentBox/>,
    document.getElementById('comment')
);

//browserify --debug app-hello.js > bundle.js
//browserify  app-hello.js > bundle.js
