'use strict';
var path = require('path');
var gutil = require('gulp-util');
var through = require('through2');
var Jasmine = require('jasmine');
var Reporter = require('jasmine-terminal-reporter');
var SilentReporter = require('./silent-reporter');

function deleteRequireCache( id ) {
	// recursively delete source code to be tested, 
	// but skip mature code loaded from node_modules
	if(id.indexOf('node_modules') >= 0) return;
	var files = require.cache[ id ];
	if (typeof files !== 'undefined') {
		for (var i in files.children) {
			deleteRequireCache( files.children[i].id );
		}
		delete require.cache[ id ];
	}
}

function deleteRequireCache( id ) {
	// recursively delete source code to be tested, 
	// but skip mature code loaded from node_modules
	if(id.indexOf('node_modules') >= 0) return;
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
	} else {
		jasmine.addReporter(new Reporter({
			isVerbose: options.verbose,
			showColors: color,
			includeStackTrace: options.includeStackTrace
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
			jasmine.addReporter(new SilentReporter(cb));
			jasmine.execute();
		} catch (err) {
			cb(new gutil.PluginError('gulp-jasmine', err));
		}
	});
};
