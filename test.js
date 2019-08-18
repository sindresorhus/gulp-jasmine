import test from 'ava';
import Vinyl from 'vinyl';
import through2 from 'through2';
import gulpJasmine from '.';

const out = process.stdout.write.bind(process.stdout);

function jasmine(file, options) {
	return new Promise((resolve, reject) => {
		const stream = gulpJasmine(options);

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
			contents: Buffer.from('')
		}));

		stream.end();
	});
}

test('run unit test and pass', async t => {
	const {output, passed} = await jasmine('fixture.js', {
		timeout: 9000,
		verbose: true
	});

	t.true(/should pass: passed/.test(output));
	t.true(passed);
});

test('run unit test and fail silently', async t => {
	const {output, passed} = await jasmine('fail-fixture.js', {
		timeout: 9000,
		verbose: true,
		errorOnFail: false
	});

	t.true(/should fail: failed/.test(output));
	t.false(passed);
});

test('run unit test and fail', async t => {
	let errorThrown = 0;
	try {
		await jasmine('fail-fixture.js', {
			timeout: 9000,
			verbose: true
		});
	} catch (_) {
		errorThrown++;
	}

	t.is(errorThrown, 1);
});

test.cb('run the test only once even if called in succession', t => {
	const stream = gulpJasmine({
		timeout: 9000,
		verbose: true
	});

	let output = '';

	const reader = through2.obj((file, encoding, callback) => {
		callback();
	}, callback => {
		process.stdout.write = out;
		t.is(output.match(/should pass: passed/g).length, 1);
		callback();
		t.end();
	});

	process.stdout.write = string => {
		output += string;
	};

	stream.pipe(reader);

	stream.write(new Vinyl({
		path: 'fixture.js',
		contents: Buffer.from('')
	}));

	stream.end();
});
