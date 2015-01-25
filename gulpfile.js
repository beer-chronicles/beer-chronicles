var gulp = require('gulp');
var path = require('path');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var stylus = require('gulp-stylus');
var plumber = require('gulp-plumber');
var connect = require('gulp-connect');

var paths = {
  assets: './assets/**/*',
  dest: './dist'
};


gulp.task('scripts', function() {
  var bundler = browserify('./src/app.js');
  return bundler.bundle()
    .pipe(source('app.js'))
    .pipe(plumber())
    .pipe(gulp.dest(paths.dest))
    .pipe(connect.reload());
});

gulp.task('styles', function() {
  return gulp.src('./src/styles/main.styl')
    .pipe(plumber())
    .pipe(stylus())
    .pipe(gulp.dest(paths.dest))
    .pipe(connect.reload());
});

gulp.task('template', function() {
  return gulp.src('./src/*.html')
    .pipe(plumber())
    .pipe(gulp.dest(paths.dest))
    .pipe(connect.reload());
});

gulp.task('assets', function() {
  gulp.src(paths.assets)
    .pipe(plumber())
    .pipe(gulp.dest(path.join(paths.dest, 'assets')))
    .pipe(connect.reload());
});

gulp.task('watch', function() {
  gulp.watch('./src/index.html', ['template']);
  gulp.watch('./src/**/*.js', ['scripts']);
  gulp.watch('./src/**/*.styl', ['styles']);
  gulp.watch(paths.assets, ['assets']);
});

gulp.task('server', function() {
  connect.server({
    root: './dist',
    port: 3000,
    livereload: true
  });
});

gulp.task('build', ['assets', 'scripts', 'styles', 'template']);

gulp.task('default', ['build', 'watch', 'server']);
