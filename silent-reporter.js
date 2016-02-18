'use strict';
var gutil = require('gulp-util');

module.exports = function (cb, errorOnFail) {
	var failureCount = 0;

	this.specDone = function (result) {
		if (result.status === 'failed') {
			failureCount++;
		}
	};

	this.jasmineDone = function () {
		if (errorOnFail && failureCount > 0) {
			cb(new gutil.PluginError('gulp-jasmine', 'Tests failed', {
				showStack: false
			}));
		} else {
			cb();
		}
	};
};
