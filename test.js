'use strict';
var assert = require('assert');
var gutil = require('gulp-util');
var through2 = require('through2');
var jasmine = require('./');
var out = process.stdout.write.bind(process.stdout);

it('should run unit test and pass', function (cb) {
	var stream = jasmine({verbose: true});

	process.stdout.write = function (str) {
		out(str);

		if (/should pass/.test(str)) {
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
		assert.equal(output.match(/should pass/g).length, 1);
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
