'use strict';
var assert = require('assert');
var gutil = require('gulp-util');
var jasmine = require('../index');
var through2 = require('through2');
var out = process.stdout.write.bind(process.stdout);

it('should run unit test and pass', function (cb) {
	var stream = jasmine({verbose: true});

	process.stdout.write = function (str) {
		// out(str);

		if (/1 spec, 0 failures/.test(str)) {
			assert(true);
			process.stdout.write = out;
			cb();
		}
	};

	stream.write(new gutil.File({
		path: 'fixture.js',
		contents: new Buffer('')

	}));
	stream.end();
});

it('should run the test only once even if called in succession', function (done) {
	var stream = jasmine({verbose: true});
	var output = '';
	var reader = through2.obj(function (file, enc, cb) {
		cb();
	}, function (cb) {
		process.stdout.write = out;
		// out(output);
		assert.equal(output.match(/1 spec, 0 failures/g).length, 1);
		done();
		cb();
	});

	process.stdout.write = function (str) {
		output += str;
	};

	stream.pipe(reader);

	stream.write(new gutil.File({
		path: 'fixture.js',
		contents: new Buffer('')
	}));

	stream.end();
});

gutil.log("end: test suite !");
