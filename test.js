'use strict';
var assert = require('assert');
var gutil = require('gulp-util');
var through2 = require('through2');
var jasmine = require('./');
var out = process.stdout.write.bind(process.stdout);

it('should run unit test and pass', function (cb) {
	var stream = jasmine({
		timeout: 9000,
		verbose: true
	});

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
	var stream = jasmine({
		timeout: 9000,
		verbose: true
	});
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

it('should run all tests when new tests are added while running tests.', function (done) {
	var numTasks = 0;
	var output = '';
	var oldWrite = process.stdout.write;
	process.stdout.write = function (str) {
		output += str;
	};
	var startStream = function() {
		numTasks++;
		var stream = jasmine({
			timeout: 9000,
			verbose: true
		});
		var reader = through2.obj(function (file, enc, cb) {
			cb();
		}, function (cb) {
			process.stdout.write = out;
			assert.equal(output.match(/should pass another test: passed/g).length, 1);
			if (--numTasks <= 0) {
				done();
			}
			cb();
		});

		stream.pipe(reader);

		return stream;
	};

	var otherFixtureStream = startStream();
	var fixtureStream = startStream();


	fixtureStream.write(new gutil.File({
		path: 'fixture.js',
		contents: new Buffer('')
	}));

	otherFixtureStream.write(new gutil.File({
		path: 'otherFixture.js',
		contents: new Buffer('')
	}));

	fixtureStream.end();
	otherFixtureStream.end();
});
