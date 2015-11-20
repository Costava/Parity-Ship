var gulp = require('gulp');
var gutil = require('gulp-util');

var runSequence = require('run-sequence');

var del = require('del');

var Promise = require('bluebird');
var webpack = require('webpack');

var webpackConfig = require('./webpack.config.js');

var uglify = require('gulp-uglify');
var rename = require('gulp-rename');

// Default Task
gulp.task('default', function(callback) {
	runSequence(
		['build-clean'],
		['move-html', 'move-css', 'build-scripts'],
		callback
	);
});

// Clears the distribution folder before running the other tasks
gulp.task('build-clean', function() {
	 return del(['./dist']);
});

gulp.task('move-html', function() {
	gulp.src(['./src/index.html'])
		.pipe(gulp.dest('./dist'));
});

gulp.task('move-css', function() {
	gulp.src(['./src/styles/style.css'])
		.pipe(gulp.dest('./dist/styles'));
});

gulp.task('build-scripts', function() {
  return Promise.promisify(webpack)(webpackConfig)
	.catch(function(err) {
		if(err) {
			throw new gutil.PluginError('webpack', err);
		}
	});
});
