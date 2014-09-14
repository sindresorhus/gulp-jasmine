'use strict';
var path = require('path');
var gutil = require('gulp-util');
var through = require('through2');
var requireUncached = require('require-uncached');

module.exports = function (options) {
	options = options || {};

	var miniJasmineLib = requireUncached('minijasminenode2');
	var color = process.argv.indexOf('--no-color') === -1;
	var reporter = options.reporter;

	if (reporter) {
		(Array.isArray(reporter) ? reporter : [reporter]).forEach(function (el) {
			miniJasmineLib.addReporter(el);
		});
	}

	return through.obj(function (file, enc, cb) {
		if (file.isNull()) {
			cb(null, file);
			return;
		}

		if (file.isStream()) {
			cb(new gutil.PluginError('gulp-jasmine', 'Streaming not supported'));
			return;
		}

		/**
		 * Get the cache object of the specs.js file,
		 * get its children and delete the childrens cache
		 */
		var modId = require.resolve(path.resolve(file.path));
		var files = require.cache[modId];
		if (typeof files !== 'undefined') {
			for (var i in files.children) {
				delete require.cache[files.children[i].id];
			}
		}

		delete require.cache[modId];
		miniJasmineLib.addSpecs(file.path);

		cb(null, file);
	}, function (cb) {
		try {
			miniJasmineLib.executeSpecs({
				isVerbose: options.verbose,
				includeStackTrace: options.includeStackTrace,
				defaultTimeoutInterval: options.timeout,
				showColors: color,
				onComplete: function (passed) {
					cb(passed ? null : new gutil.PluginError('gulp-jasmine', 'Tests failed', {
						showStack: false
					}));
				}
			});
		} catch (err) {
			cb(new gutil.PluginError('gulp-jasmine', err));
		}
	});
};
