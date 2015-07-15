var arrify = require('arrify');
var gutil = require('gulp-util');
var Jasmine = require('jasmine');
var Reporter = require('jasmine-terminal-reporter');
var SilentReporter = require('./silent-reporter');

var jasmine;
var uncaughtError = null;

function instantiate (options) {
	jasmine = new Jasmine();

	if (options.timeout) {
		jasmine.jasmine.DEFAULT_TIMEOUT_INTERVAL = options.timeout;
	}

	if (options.reporter) {
		arrify(options.reporter).forEach(function (reporter) {
			jasmine.addReporter(reporter);
		});
	} else {
		jasmine.addReporter(new Reporter({
			isVerbose: options.verbose,
			showColors: options.showColors,
			includeStackTrace: options.includeStackTrace
		}));
	}
}

function addSpec (path) {
	jasmine.addSpecFile(path);
}

function run () {
	try {
		jasmine.addReporter(new SilentReporter(function (err) {
			if (uncaughtError) {
				err = new gutil.PluginError('gulp-jasmine', uncaughtError);
			}
			process.send(err || null);
		}));
		jasmine.execute();
	} catch (err) {
		process.send(new gutil.PluginError('gulp-jasmine', err));
	}
}

process.on('uncaughtException', function (err) {
	uncaughtError = err;
});

process.on('message', function(message) {
	if (!message || !message.type) {
		throw new Error('message.type must be defined');
	}

	switch (message.type) {
		case 'instantiate':
			instantiate(message.options);
			break;
		case 'addSpec':
			addSpec(message.path);
			break;
		case 'run':
			run();
			break;
		default:
			throw new Error('Message type ' + message.type + ' not supported');
	}
});
