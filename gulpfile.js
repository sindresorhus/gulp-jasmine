'use strict';

var gulp = require('gulp');
var merge = require('merge-stream');
var flag = require('./flag');

var jasmine = require('./');

gulp.task('default', function () {
	flag.testsDone = false;

	var first = gulp.src('fixture.js')
		.pipe(jasmine({timeout: 1500, verbose: true}))
		.on('end', function() { check(flag.testsDone, 'unfinished tests after \'end\' event'); })
	;
	var second = gulp.src('fail-fixture.js')
		.pipe(jasmine({verbose: true, errorOnFail: false}))
	;

	var vinyls = [];
	return merge(first, second)
		.on('data', function(file) { vinyls.push(file); })
		.on('end', function() {
			check(vinyls.length === 2, 'expected 2 vinyls in stream; got'+ vinyls.length);
		})
	;
});

function check(condition, message) {
	if (!condition) {
		throw new Error(message);
	}
}

