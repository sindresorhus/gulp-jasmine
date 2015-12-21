'use strict';
var assert = require('assert');
var gutil = require('gulp-util');
var through2 = require('through2');
var jasmine = require('./');
var out = process.stdout.write.bind(process.stdout);

var numberOneMatcher = function () {
	return {
		compare: function (value) {
			var isOne = value === 1;
			return {
				pass: isOne,
				message: isOne ? "Expected " + value + " not to be 1" : "Expected " + value + " to be 1"
			};
		}
	}
};

describe('gulp-jasmine', function () {
	beforeEach(function () {
		this.stream = jasmine({
			timeout: 9000,
			verbose: true,
			matchers: {
				toBeTheNumberOne: numberOneMatcher
			}
		});

		this.writeFileOnStream = function () {
			this.stream.write(new gutil.File({
				path: 'fixture.js',
				contents: new Buffer('')
			}));

			this.stream.end();
		};
	});

	describe('simple unit test', function () {
		beforeEach(function () {
			process.stdout.write = function (str) {
				this.assertion(str);
			}.bind(this);
		});

		it('should run and pass', function (done) {
			this.assertion = function (str) {
				if (/should pass/.test(str)) {
					process.stdout.write = out;
					assert(true);
					done();
				}
			};

			this.writeFileOnStream();
		});
	});

	describe('if called in succession', function () {
		beforeEach(function () {
			var output = '';
			process.stdout.write = function (str) {
				output += str;
			};

			var reader = through2.obj(function (file, enc, cb) {
				cb();
			}, function (cb) {
				this.assertion(output);
				cb();
			}.bind(this));

			this.stream.pipe(reader);
		});

		it('should run the test only once', function (done) {
			this.assertion = function (str) {
				process.stdout.write = out;
				assert.equal(str.match(/should pass/g).length, 1);
				done();
			};

			this.writeFileOnStream();
		});
	});
});
