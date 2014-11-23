# [gulp](http://gulpjs.com)-jasmine [![Build Status](https://travis-ci.org/sindresorhus/gulp-jasmine.svg?branch=master)](https://travis-ci.org/sindresorhus/gulp-jasmine)

> Run [Jasmine](http://jasmine.github.io/2.0/introduction.html) tests with [minijasminenode](https://github.com/juliemr/minijasminenode) *(Jasmine 2.0)*

*Issues with the output should be reported on the minijasminenode [issue tracker](https://github.com/juliemr/minijasminenode).*


## Install

```sh
$ npm install --save-dev gulp-jasmine
```


## Usage

```js
var gulp = require('gulp');
var jasmine = require('gulp-jasmine');

gulp.task('default', function () {
	return gulp.src('spec/test.js')
		.pipe(jasmine());
});
```


## API

### jasmine(options)

#### options

##### reporter

Type: `object`, `array` of `objects`

Reporters to use.

```js
var gulp = require('gulp');
var jasmine = require('gulp-jasmine');
var reporters = require('jasmine-reporters');

gulp.task('default', function () {
	return gulp.src('spec/test.js')
		.pipe(jasmine({
			reporter: new reporters.JUnitXmlReporter()
		}));
});
```

[Creating your own reporter.](http://jasmine.github.io/2.1/custom_reporter.html)

##### verbose

Type: `boolean`  
Default: `false`

Display spec names.

##### includeStackTrace

Type: `boolean`  
Default: `false`

Include stack traces in failures.

##### timeout

Type: `number`  
Default `5000`

Time to wait in milliseconds before a test automatically fails.


## License

MIT © [Sindre Sorhus](http://sindresorhus.com)
