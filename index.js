'use strict';
var path = require('path');
var gutil = require('gulp-util');
var through = require('through2');
var requireLike = require('require-like');
var jasmineRequire = requireLike(require.resolve('./'), true);
var gutilReporter = function(){
	gutil.log('adding gutil as reporter');
	return [gutil.log];
}

module.exports = function (options) {
	options = options || {};

	var jasmineBootStrap = jasmineRequire('./jasmine-npm-bootstrap')(false);
	var color = process.argv.indexOf('--no-color') === -1;
	var reporter = options.reporter;

	var reporters = undefined;
	if(Array.isArray(reporter))
		reporters = reporter;
	else
		reporters = gutilReporter();

	jasmineBootStrap.addReporters(reporters);

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
		jasmineBootStrap.addSpecs(file.path);

		this.push(file);
		cb();
	}, function (cb) {
		try {
			gutil.log('gulp-jasmine: trying to run jasmine!');
			jasmineBootStrap.run();
			cb();
			gutil.log('gulp-jasmine: end run jasmine!');
		} catch (err) {
			this.emit('error', new gutil.PluginError('gulp-jasmine', err));
			cb();
		}
	});
};
