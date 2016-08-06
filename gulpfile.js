'use strict';

var gulp = require('gulp');
var jasmine = require('./');
var flag = require('./flag');

gulp.task('default', function () {
	return gulp.src('fixture.js')
		.pipe(jasmine({	timeout: 1500 }))
		.on('end', checkTestsDone)
	;
});

function checkTestsDone() {
	if (!flag.testsDone) {
		throw new Error('jasmine should not be running after \'end\' event');
	}
}

