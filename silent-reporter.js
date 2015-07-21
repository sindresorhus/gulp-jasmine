'use strict';
var gutil = require('gulp-util');

module.exports = function (cb) {
	var failureCount = 0;

	this.jasmineStarted = function (info) {
		process.send({ event: 'jasmineStarted', data: info });
	};

	this.suiteStarted = function (suiteInfo) {
		process.send({ event: 'suiteStarted', data: suiteInfo });
	};

	this.specStarted = function (specInfo) {
		process.send({ event: 'specStarted', data: specInfo });
	};

	this.specDone = function (result) {
		process.send({ event: 'specDone', data: result });
		if (result.status === 'failed') {
			failureCount++;
		}
	};

	this.suiteDone = function (result) {
		process.send({ event: 'suiteDone', data: result });
	};

	this.jasmineDone = function () {
		process.send({ event: 'jasmineDone' });

		if (failureCount > 0) {
			cb(new gutil.PluginError('gulp-jasmine', 'Tests failed', {
				showStack: false
			}));
			return;
		}

		cb();
	};
};
