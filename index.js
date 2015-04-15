'use strict';
var path = require('path');
var gutil = require('gulp-util');
var through = require('through2');
var Jasmine = require('jasmine');
var Reporter = require('jasmine-terminal-reporter');
var SilentReporter = require('./silent-reporter');
var jasmineInstance;

function deleteRequireCache(id) {
	if (!id || id.indexOf('node_modules') !== -1) {
		return;
	}

	var files = require.cache[id];

	if (files !== undefined) {
		for (var file in files.children) {
			deleteRequireCache(files.children[file].id);
		}

		delete require.cache[id];
	}
}

module.exports = function (options) {
	options = options || {};

	// Keep a reference to the jasmine instance that is created until it is executed to allow multiple pipes to jasmine-gulp to
	// aggregate their files.
	// Without this overlapping calls to jasmine-gulp from streams running in parallel will only run the tests from the last stream
	// to call jasmine-gulp.
	// TODO: figure out a way to combine their reporters.
	var jasmine = jasmineInstance;
	if (!jasmine) {
		jasmine = jasmineInstance = new Jasmine();

		if (options.timeout) {
			jasmine.jasmine.DEFAULT_TIMEOUT_INTERVAL = options.timeout;
		}

		var color = process.argv.indexOf('--no-color') === -1;
		var reporter = options.reporter;

		if (reporter) {
			(Array.isArray(reporter) ? reporter : [reporter]).forEach(function (el) {
				jasmine.addReporter(el);
			});
		} else {
			jasmine.addReporter(new Reporter({
				isVerbose: options.verbose,
				showColors: color,
				includeStackTrace: options.includeStackTrace
			}));
		}
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

		// get the cache object of the specs.js file,
		// delete it and its children recursively from cache
		var resolvedPath = path.resolve(file.path);
		var modId = require.resolve(resolvedPath);
		deleteRequireCache(modId);
		jasmine.addSpecFile(resolvedPath);

		cb(null, file);
	}, function (cb) {
		try {
			if (jasmineInstance) {
				jasmineInstance = null; // release the global jasmine instance.
				jasmine.addReporter(new SilentReporter(cb));
				jasmine.execute();
			} else {
				cb();
			}
		} catch (err) {
			jasmineInstance = null; // release the global jasmine instance.
			cb(new gutil.PluginError('gulp-jasmine', err));
		}
	});
};
