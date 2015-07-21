'use strict';
var path = require('path');
var gutil = require('gulp-util');
var through = require('through2');
var arrify = require('arrify');
var Reporter = require('jasmine-terminal-reporter');

module.exports = function (options) {
	var reporters;
	options = options || {};
	options.showColors = process.argv.indexOf('--no-color') === -1;

	if (options.reporter) {
		reporters = arrify(options.reporter);
	} else {
		reporters = [new Reporter({
			isVerbose: options.verbose,
			showColors: options.showColors,
			includeStackTrace: options.includeStackTrace
		})];
	}

	var runner = require('child_process').fork(path.join(__dirname, 'runner'));

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
		runner.on('message', function (message) {
			switch (message.event) {
				case 'success':
					cb();
					runner.kill();
					break;
				case 'error':
					cb(new gutil.PluginError('gulp-jasmine', message.data));
					runner.kill();
					break;
				default:
					reporters.forEach(function (reporter) {
						if (reporter[message.event]) {
							reporter[message.event](message.data);
						}
					});
			}

		});

		runner.send({
			type: 'run'
		});
	});
};
