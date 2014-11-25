var gutil = require('gulp-util');

module.exports = function(done) {
	var failureCount = 0;

	this.jasmineDone = function() {
		var result = failureCount === 0 ? null : new gutil.PluginError('gulp-jasmine', 'Tests failed', {
			showStack: false
		});
		done(result);
	};

	this.specDone = function(result) {
		if (result.status === 'failed') {
			failureCount++;
		}
	};
};
