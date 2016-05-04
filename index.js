'use strict';
var path = require('path');
var arrify = require('arrify');
var gutil = require('gulp-util');
var through = require('through2');
var Jasmine = require('jasmine');
var Reporter = require('jasmine-terminal-reporter');
var SilentReporter = require('./silent-reporter');

function deleteRequireCache(id) {
	if (!id || id.indexOf('node_modules') !== -1) {
		return;
	}

	var files = require.cache[id];

	if (files !== undefined) {
		Object.keys(files.children).forEach(function (file) {
			deleteRequireCache(files.children[file].id);
		});

		delete require.cache[id];
	}
}

module.exports = function (opts) {
	opts = opts || {};

	var jasmine = new Jasmine();

	if (opts.timeout) {
		jasmine.jasmine.DEFAULT_TIMEOUT_INTERVAL = opts.timeout;
	}

	if (opts.config) {
		jasmine.loadConfig(opts.config);
	}

	var errorOnFail = opts.errorOnFail === undefined ? true : opts.errorOnFail;
	var color = process.argv.indexOf('--no-color') === -1;
	var reporter = opts.reporter;

	if (reporter) {
		arrify(reporter).forEach(function (el) {
			jasmine.addReporter(el);
		});
	} else {
		jasmine.addReporter(new Reporter({
			isVerbose: opts.verbose,
			showColors: color,
			includeStackTrace: opts.includeStackTrace
		}));
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
		var self = this;

		try {
			if (jasmine.helperFiles) {
				jasmine.helperFiles.forEach(function (helper) {
					var resolvedPath = path.resolve(helper);
					var modId = require.resolve(resolvedPath);
					deleteRequireCache(modId);
				});
			}
			jasmine.addReporter(new SilentReporter(function (error) {
				if (error) {
					cb(error);
				} else {
					self.emit('jasmineDone');
					cb();
				}
			}, errorOnFail));
			jasmine.execute();
		} catch (err) {
			cb(new gutil.PluginError('gulp-jasmine', err, {showStack: true}));
		}
	});
};
