# gulp-jasmine [![Build Status](https://travis-ci.org/sindresorhus/gulp-jasmine.svg?branch=master)](https://travis-ci.org/sindresorhus/gulp-jasmine)

> Run [Jasmine 2](http://jasmine.github.io/2.1/introduction.html) tests in Node.js

*Issues with the output should be reported on the Jasmine [issue tracker](https://github.com/jasmine/jasmine/issues).*


## Install

```
$ npm install --save-dev gulp-jasmine
```


## Usage

```js
const gulp = require('gulp');
const jasmine = require('gulp-jasmine');

gulp.task('default', () =>
	gulp.src('spec/test.js')
		// gulp-jasmine works on filepaths so you can't have any plugins before it
		.pipe(jasmine())
);
```


## API

### jasmine([options])

#### options

##### verbose

Type: `boolean`<br>
Default: `false`

Display spec names in default reporter.

##### includeStackTrace

Type: `boolean`<br>
Default: `false`

Include stack traces in failures in default reporter.

##### reporter

Type: `object`, `array` of `objects`

Reporters to use.

```js
const gulp = require('gulp');
const jasmine = require('gulp-jasmine');
const reporters = require('jasmine-reporters');

gulp.task('default', () =>
	gulp.src('spec/test.js')
		.pipe(jasmine({
			reporter: new reporters.JUnitXmlReporter()
		}))
);
```

[Creating your own reporter.](http://jasmine.github.io/2.1/custom_reporter.html)

##### timeout

Type: `number`<br>
Default `5000`

Time to wait in milliseconds before a test automatically fails.

##### errorOnFail

Type: `boolean`<br>
Default: `true`

Stops the stream on failed tests.

##### config

Type: `object`

Passes the config to Jasmine's [loadConfig](http://jasmine.github.io/2.3/node.html#section-Load_configuration_from_a_file_or_from_an_object.) method.


## FAQ

### Babel

Add `require('babel-core/register');` to the top of your `gulpfile.js`. Make sure to read the [Babel docs](https://babeljs.io/docs/usage/require/).


## License

MIT © [Sindre Sorhus](http://sindresorhus.com)
