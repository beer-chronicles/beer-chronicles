var gulp = require('gulp');
var browserify = require('browserify');
var source = require('vinyl-source-stream');


gulp.task('scripts', function() {
  var bundler = browserify('./src/app.js');
  return bundler.bundle()
    .pipe(source('app.js'))
    .pipe(gulp.dest('./dist'));
});

gulp.task('default', function() {
  console.log('welcome to beer chronicles!');
});
