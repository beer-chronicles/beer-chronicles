var gulp = require('gulp');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var stylus = require('gulp-stylus');
var connect = require('gulp-connect');

var paths = {
  dest: './dist'
};


gulp.task('scripts', function() {
  var bundler = browserify('./src/app.js');
  return bundler.bundle()
    .pipe(source('app.js'))
    .pipe(gulp.dest(paths.dest))
    .pipe(connect.reload());
});

gulp.task('styles', function() {
  return gulp.src('./src/styles/main.styl')
    .pipe(stylus())
    .pipe(gulp.dest(paths.dest))
    .pipe(connect.reload());
});

gulp.task('template', function() {
  return gulp.src('./src/index.html')
    .pipe(gulp.dest(paths.dest))
    .pipe(connect.reload());
});

gulp.task('watch', function() {
  gulp.watch('./src/index.html', ['template']);
  gulp.watch('./src/**/*.js', ['scripts']);
  gulp.watch('./src/**/*.styl', ['styles']);
});

gulp.task('server', function() {
  connect.server({
    root: './dist',
    port: 3000,
    livereload: true
  });
});

gulp.task('build', ['scripts', 'styles', 'template']);

gulp.task('default', ['build', 'watch', 'server']);
