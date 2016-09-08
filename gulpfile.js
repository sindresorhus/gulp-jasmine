'use strict';

var gulp = require('gulp');
var merge = require('merge-stream');
var flag = require('./flag');

var jasmine = require('./');

gulp.task('default', function () {
	flag.testsDone = false;

	var first = gulp.src('fixture.js')
		.pipe(jasmine({timeout: 1500}))
		.on('end', checkTestsDone)
	;
	var second = gulp.src('nonexistent.js')
		.pipe(jasmine())
	;
	return merge(first, second);
});

function checkTestsDone() {
	if (!flag.testsDone) {
		throw new Error('unfinished tests after \'end\' event');
	}
}

