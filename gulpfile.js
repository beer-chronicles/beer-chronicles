var gulp = require('gulp');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var connect = require('gulp-connect');


gulp.task('scripts', function() {
  var bundler = browserify('./src/app.js');
  return bundler.bundle()
    .pipe(source('app.js'))
    .pipe(gulp.dest('./dist'));
});

gulp.task('server', function() {
  connect.server({
    root: './dist',
    port: 3000
  });
});

gulp.task('default', function() {
  console.log('welcome to beer chronicles!');
});
