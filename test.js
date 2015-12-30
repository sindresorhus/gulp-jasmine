import test from 'ava';
import gutil from 'gulp-util';
import through2 from 'through2';
import fn from './';

const out = process.stdout.write.bind(process.stdout);

function jasmine(options) {
	return new Promise((resolve, reject) => {
		const stream = fn(options);

		let output = '';

		process.stdout.write = str => {
			out(str);

			output += str;
		};

		stream.on('data', () => { });

		stream.on('error', reject);

		stream.on('end', () => {
			resolve(output);
		});

		stream.write(new gutil.File({
			path: 'fixture.js',
			contents: new Buffer('')
		}));

		stream.end();
	});
}

test('run unit test and pass', async t => {
	const stdout = await jasmine({timeout: 9000, verbose: true});

	t.true(/should pass: passed/.test(stdout));
});

test.cb('run the test only once even if called in succession', t => {
	const stream = fn({timeout: 9000, verbose: true});
	let output = '';
	const reader = through2.obj((file, enc, cb) => {
		cb();
	}, cb => {
		process.stdout.write = out;
		t.is(output.match(/should pass: passed/g).length, 1);
		t.end();
		cb();
	});

	process.stdout.write = str => output += str;
	stream.pipe(reader);

	stream.write(new gutil.File({
		path: 'fixture.js',
		contents: new Buffer('')
	}));

	stream.end();
});
