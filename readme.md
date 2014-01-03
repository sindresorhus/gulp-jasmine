# [gulp](https://github.com/wearefractal/gulp)-jasmine [![Build Status](https://secure.travis-ci.org/sindresorhus/gulp-jasmine.png?branch=master)](http://travis-ci.org/sindresorhus/gulp-jasmine)

> Run [Jasmine](http://visionmedia.github.io/jasmine/) tests with [minijasminenode](https://github.com/juliemr/minijasminenode)

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


## License

MIT © [Sindre Sorhus](http://sindresorhus.com)
