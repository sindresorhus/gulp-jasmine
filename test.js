'use strict';
var assert = require('assert');
var gutil = require('gulp-util');
var jasmine = require('./index');
var out = process.stdout.write.bind(process.stdout);

it('should run unit test and pass', function (cb) {
	var stream = jasmine();

	process.stdout.write = function (str) {
		out(str);

		if (/1 assertion/.test(str)) {
			assert(true);
			process.stdout.write = out;
			cb();
		}
	};

	stream.write(new gutil.File({path: 'fixture.js'}));
	stream.end();
});
