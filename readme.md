# [gulp](http://gulpjs.com)-jasmine [![Build Status](https://travis-ci.org/sindresorhus/gulp-jasmine.svg?branch=master)](https://travis-ci.org/sindresorhus/gulp-jasmine)

> Run [Jasmine](http://jasmine.github.io/1.3/introduction.html) tests with [minijasminenode](https://github.com/juliemr/minijasminenode) *(Jasmine 1.3)*

*Issues with the output should be reported on the minijasminenode [issue tracker](https://github.com/juliemr/minijasminenode).*


## Install

```bash
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

Type: `Object`, `Array` of `Objects`

Reporter(s) to use.

##### verbose

Type: `Boolean`  
Default: `false`

Display spec names.

##### includeStackTrace

Type: `Boolean`  
Default: `false`

Include stack traces in failures.

##### timeout

Type: `Number`  
Default `5000`

Time to wait in milliseconds before a test automatically fails.


## License

[MIT](http://opensource.org/licenses/MIT) © [Sindre Sorhus](http://sindresorhus.com)
