import test from 'ava';
import Vinyl from 'vinyl';
import through2 from 'through2';
import fn from './';

const out = process.stdout.write.bind(process.stdout);

function jasmine(file, options) {
	return new Promise((resolve, reject) => {
		const stream = fn(options);

		let output = '';

		process.stdout.write = str => {
			out(str);
			output += str;
		};

		stream.on('error', reject);

		stream.on('jasmineDone', passed => {
			resolve({output, passed});
		});

		stream.write(new Vinyl({
			path: file,
			contents: new Buffer('')
		}));

		stream.end();
	});
}

test('run unit test and pass', async t => {
	const {output, passed} = await jasmine('fixture.js', {timeout: 9000, verbose: true});

	t.true(/should pass: passed/.test(output));
	t.true(passed);
});

test('run unit test and fail silently', async t => {
	const {output, passed} = await jasmine('fail-fixture.js', {timeout: 9000, verbose: true, errorOnFail: false});

	t.true(/should fail: failed/.test(output));
	t.false(passed);
});

test('run unit test and fail', async t => {
	let errorThrown = 0;
	try {
		await jasmine('fail-fixture.js', {timeout: 9000, verbose: true});
	} catch (err) {
		errorThrown++;
	}

	t.is(errorThrown, 1);
});

test.cb('run the test only once even if called in succession', t => {
	const stream = fn({timeout: 9000, verbose: true});
	let output = '';
	const reader = through2.obj((file, enc, cb) => {
		cb();
	}, cb => {
		process.stdout.write = out;
		t.is(output.match(/should pass: passed/g).length, 1);
		cb();
		t.end();
	});

	process.stdout.write = str => {
		output += str;
	};
	stream.pipe(reader);

	stream.write(new Vinyl({
		path: 'fixture.js',
		contents: new Buffer('')
	}));

	stream.end();
});
