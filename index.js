'use strict';
const path = require('path');
const arrify = require('arrify');
const PluginError = require('plugin-error');
const through = require('through2');
const Jasmine = require('jasmine');
const Reporter = require('jasmine-terminal-reporter');

function deleteRequireCache(id) {
	if (!id || id.includes('node_modules')) {
		return;
	}

	const files = require.cache[id];

	if (files !== undefined) {
		for (const file of Object.keys(files.children)) {
			deleteRequireCache(files.children[file].id);
		}

		delete require.cache[id];
	}
}

module.exports = options => {
	options = options || {};

	const jasmine = new Jasmine();

	if (options.timeout) {
		jasmine.jasmine.DEFAULT_TIMEOUT_INTERVAL = options.timeout;
	}

	if (options.config) {
		jasmine.loadConfig(options.config);
	}

	const errorOnFail = options.errorOnFail === undefined ? true : options.errorOnFail;
	const color = process.argv.indexOf('--no-color') === -1;
	const reporter = options.reporter;

	// Default reporter behavior changed in 2.5.2
	if (jasmine.env.clearReporters) {
		jasmine.env.clearReporters();
	}

	if (reporter) {
		for (const el of arrify(reporter)) {
			jasmine.addReporter(el);
		}
	} else {
		jasmine.addReporter(new Reporter({
			isVerbose: options.verbose,
			showColors: color,
			includeStackTrace: options.includeStackTrace
		}));
	}

	return through.obj((file, enc, cb) => {
		if (file.isNull()) {
			cb(null, file);
			return;
		}

		if (file.isStream()) {
			cb(new PluginError('gulp-jasmine', 'Streaming not supported'));
			return;
		}

		// Get the cache object of the specs.js file,
		// delete it and its children recursively from cache
		const resolvedPath = path.resolve(file.path);
		const modId = require.resolve(resolvedPath);
		deleteRequireCache(modId);

		jasmine.addSpecFile(resolvedPath);

		cb(null, file);
	}, function (cb) {
		const self = this;

		try {
			if (jasmine.helperFiles) {
				for (const helper of jasmine.helperFiles) {
					const resolvedPath = path.resolve(helper);
					const modId = require.resolve(resolvedPath);
					deleteRequireCache(modId);
				}
			}

			jasmine.onComplete(passed => {
				if (errorOnFail && !passed) {
					cb(new PluginError('gulp-jasmine', 'Tests failed', {
						showStack: false
					}));
				} else {
					self.emit('jasmineDone', passed);
					cb();
				}
			});

			jasmine.execute();
		} catch (err) {
			cb(new PluginError('gulp-jasmine', err, {showStack: true}));
		}
	});
};
