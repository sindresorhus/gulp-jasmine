# [gulp](https://github.com/wearefractal/gulp)-jasmine [![Build Status](https://secure.travis-ci.org/sindresorhus/gulp-jasmine.png?branch=master)](http://travis-ci.org/sindresorhus/gulp-jasmine)

> Run [Jasmine](http://visionmedia.github.io/jasmine/) tests with [minijasminenode](https://github.com/juliemr/minijasminenode) *(Jasmine 1.3)*

*Issues with the output should be reported on the minijasminenode [issue tracker](https://github.com/juliemr/minijasminenode).*


## Install

Install with [npm](https://npmjs.org/package/gulp-jasmine)

```
npm install --save-dev gulp-jasmine
```


## Example

```js
var gulp = require('gulp');
var jasmine = require('gulp-jasmine');

gulp.task('default', function () {
	gulp.src('spec/test.js')
		.pipe(jasmine());
});
```

## API

### jasmine(options)

#### options

##### reporter

Type: `Object`

Reporter to use.

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

##### showColors

Type: `Boolean`
Default `false`

Print colors to the terminal


## License

MIT © [Sindre Sorhus](http://sindresorhus.com)
