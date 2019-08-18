'use strict';
const gulp = require('gulp');
const jasmine = require('.');

exports.default = () => (
	gulp.src('fixture.js')
		.pipe(jasmine({
			timeout: 10000
		}))
);
