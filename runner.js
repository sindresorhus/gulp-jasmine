var Jasmine = require('jasmine');
var SilentReporter = require('./silent-reporter');

var jasmine;
var uncaughtError = null;

function instantiate (options) {
	jasmine = new Jasmine();

	if (options.timeout) {
		jasmine.jasmine.DEFAULT_TIMEOUT_INTERVAL = options.timeout;
	}
}

function addSpec (path) {
	jasmine.addSpecFile(path);
}

function run () {
	try {
		jasmine.addReporter(new SilentReporter(function (err) {
			err = uncaughtError || err;
			if (err) {
				process.send({ event: 'error', data: err });
			} else {
				process.send({ event: 'success' })
			}
		}));
		jasmine.execute();
	} catch (err) {
		process.send({ event: 'error', data: err });
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
