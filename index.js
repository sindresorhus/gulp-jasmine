'use strict';
var path = require('path');
var gutil = require('gulp-util');
var through = require('through2');
var Jasmine = require('jasmine');

function deleteRequireCache( id ) {
	var files = require.cache[ id ];
	if (typeof files !== 'undefined') {
		for (var i in files.children) {
			deleteRequireCache( files.children[i].id );
		}
		delete require.cache[ id ];
	}
}

module.exports = function (options) {
	options = options || {};

	var jasmine = new Jasmine();

	if (options.timeout) {
		jasmine.jasmine.DEFAULT_TIMEOUT_INTERVAL = options.timeout;
	}

	var color = process.argv.indexOf('--no-color') === -1;
	var reporter = options.reporter;

	if (reporter) {
		(Array.isArray(reporter) ? reporter : [reporter]).forEach(function (el) {
			jasmine.addReporter(el);
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
		 * delete it and its children recursively from cache
		 */
		var resolvedPath = path.resolve(file.path);
		var modId = require.resolve(resolvedPath);
		deleteRequireCache( modId );

		jasmine.addSpecFile(resolvedPath);

		cb(null, file);
	}, function (cb) {
		try {
			jasmine.configureDefaultReporter({
				showColors: color,
				onComplete: function (passed) {
					cb(passed ? null : new gutil.PluginError('gulp-jasmine', 'Tests failed', {
						showStack: false
					}));
				}
			});
			jasmine.execute();
		} catch (err) {
			cb(new gutil.PluginError('gulp-jasmine', err));
		}
	});
};
