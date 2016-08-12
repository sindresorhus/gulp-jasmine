'use strict';
var stream = require('stream');
var path = require('path');
var arrify = require('arrify');
var gutil = require('gulp-util');
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

	var errorOnFail = opts.errorOnFail === undefined ? true : opts.errorOnFail;
	var color = process.argv.indexOf('--no-color') === -1;
	var reporter = opts.reporter;

	var resolvedPaths = [];
	var specVinyls = [];
	var readCalled = false;

	var self = new stream.Duplex({objectMode: true, allowHalfOpen: true});
	self._read = flagRead;
	self._write = memorizeVinyl;
	self.on('finish', onAllSpecsInStream);
	return self;

	function flagRead() {
		readCalled = true;
	}

	function memorizeVinyl(file, enc, cb) {
		if (file.isNull()) {
			cb();
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

		specVinyls.push(file);
		resolvedPaths.push(resolvedPath);
		cb();
	}

	function onAllSpecsInStream() {
		try {
			var jasmine = createJasmine();
			resolvedPaths.forEach(jasmine.addSpecFile.bind(jasmine));
			jasmine.addReporter(new SilentReporter(onJasmineResult, errorOnFail));

			jasmine.execute();
		} catch (err) {
			self.emit('error', new gutil.PluginError('gulp-jasmine', err, {showStack: true}));
		}
	}

	function createJasmine() {
		var jasmine = new Jasmine();

		if (opts.timeout) {
			jasmine.jasmine.DEFAULT_TIMEOUT_INTERVAL = opts.timeout;
		}
		if (opts.config) {
			jasmine.loadConfig(opts.config);
		}

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

		if (jasmine.helperFiles) {
			jasmine.helperFiles.forEach(function (helper) {
				var resolvedPath = path.resolve(helper);
				var modId = require.resolve(resolvedPath);
				deleteRequireCache(modId);
			});
		}
		return jasmine;
	}

	function onJasmineResult(error) {
		if (error) {
			self.emit('error', new gutil.PluginError('gulp-jasmine', error, {showStack: true}));
			return;
		}
		self._read = read;

		self.emit('jasmineDone');

		if (readCalled) {
			read();
		}
	}

	function read() {
		if (specVinyls.length === 0) {
			return;
		}
		self.push(specVinyls.shift());

		if (specVinyls.length === 0) {
			sendEOF();
		}
	}

	function sendEOF() {
		// this will result in emitting end
		self.push(null);
	}
};

