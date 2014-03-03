'use strict';
var path = require('path');
var gutil = require('gulp-util');
var through = require('through2');
var requireLike = require('require-like');
var jasmineRequire = requireLike(require.resolve('minijasminenode'), true);

module.exports = function (options) {
	options = options || {};

	var miniJasmineLib = jasmineRequire('minijasminenode');
	var color = process.argv.indexOf('--no-color') === -1;

	if (options.reporter) {
		if (options.reporter instanceof Array) {
			var reporters = options.reporter;
			for (var i = 0; i < reporters.length; i++) {
				miniJasmineLib.addReporter(reporters[i]);
			}
		} else {
			miniJasmineLib.addReporter(options.reporter);
		}
	}

	return through.obj(function (file, enc, cb) {
		if (file.isNull()) {
			this.push(file);
			return cb();
		}

		if (file.isStream()) {
			this.emit('error', new gutil.PluginError('gulp-jasmine', 'Streaming not supported'));
			return cb();
		}

		delete require.cache[require.resolve(path.resolve(file.path))];
		miniJasmineLib.addSpecs(file.path);

		this.push(file);
		cb();
	}, function (cb) {
		try {
			miniJasmineLib.executeSpecs({
				isVerbose: options.verbose,
				includeStackTrace: options.includeStackTrace,
				defaultTimeoutInterval: options.timeout,
				onComplete: function () {cb()},
				showColors: color
			});
		} catch (err) {
			this.emit('error', new gutil.PluginError('gulp-jasmine', err));
			cb();
		}
	});
};
