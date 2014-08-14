'use strict';
var gulp = require('gulp');
var jasmine = require('./');

gulp.task('default', function () {
	return gulp.src('fixture.js').pipe(jasmine());
});
