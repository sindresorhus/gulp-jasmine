'use strict';
var path = require('path');
var gutil = require('gulp-util');
var through = require('through2');

module.exports = function (options) {
	var runner = require('child_process').fork('./runner');

	options = options || {};
	options.showColors = process.argv.indexOf('--no-color') === -1;

	runner.send({
		type: 'instantiate',
		options: options
	});

	return through.obj(function (file, enc, cb) {
		if (file.isNull()) {
			cb(null, file);
			return;
		}

		if (file.isStream()) {
			runner.kill();
			cb(new gutil.PluginError('gulp-jasmine', 'Streaming not supported'));
			return;
		}

		runner.send({
			type: 'addSpec',
			path: path.resolve(file.path)
		});

		cb(null, file);
	}, function (cb) {
		runner.on('message', function (err) {
			cb(err);
			runner.kill();
		});

		runner.send({
			type: 'run'
		});
	});
};
