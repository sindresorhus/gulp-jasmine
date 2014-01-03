'use strict';
var path = require('path');
var through = require('through');
var gutil = require('gulp-util');

module.exports = function (options) {
	options = options || {};

	var miniJasmineLib = require('minijasminenode');

	var jasmineOptions = {
		isVerbose: options.verbose,
		includeStackTrace: options.includeStackTrace,
		defaultTimeoutInterval: options.timeout
	};

	if (options.reporter) {
		miniJasmineLib.addReporter(options.reporter);
	}

	return through(function (file) {
		delete require.cache[require.resolve(path.resolve(file.path))];
		miniJasmineLib.addSpecs(file.path);
		this.emit('data', file);
	}, function () {
		jasmineOptions.onComplete = function () {
			this.emit('end');
		}.bind(this);

		try {
			miniJasmineLib.executeSpecs(jasmineOptions);
		} catch (err) {
			this.emit('error', new Error('gulp-jasmine: ' + err));
		}
	});
};
