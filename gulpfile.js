
var gulp = require('gulp')
    ,path = require("path")
    ,deploy= require(path.resolve( "lib/core/gulp-depoly"))

gulp.task('zj' ,function( ) {
    var soucrce=path.resolve('app/zj/injected')
    var target=path.resolve('public/zj')
    deploy(soucrce,target);
});

gulp.task('public' ,function( ) {
    var soucrce=path.resolve('app/!public')
    var target=path.resolve('public')
    deploy(soucrce,target);
});

gulp.task('all', ['public','zj'] ,function( ) {
    console.log('this is the clean task');
});

gulp.task('default', function() {
    gulp.start('all');
    //var soucrce=path.resolve('app/zj/injected')
    //var target=path.resolve('public/zj')
    //deploy(soucrce,target);
});

//npm install --save-dev gulp-uglify
//gulp