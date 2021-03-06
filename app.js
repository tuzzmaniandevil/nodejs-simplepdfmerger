var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var index = require('./routes/index');

// Custom Morgan format
logger.token('real-ip', function(req, res) {
	return req.headers['x-forwarded-for'] || req.connection.remoteAddress;
})

logger.format('custom', function developmentFormatLine(tokens, req, res) {
	// get the status code if response written
	var status = res._header ?
		res.statusCode :
		undefined

	// get status color
	var color = status >= 500 ? 31 // red
		:
		status >= 400 ? 33 // yellow
		:
		status >= 300 ? 36 // cyan
		:
		status >= 200 ? 32 // green
		:
		0 // no color

	// get colored function
	var fn = developmentFormatLine[color]

	if (!fn) {
		// compile
		fn = developmentFormatLine[color] = logger.compile(':real-ip - \x1b[0m:method :url \x1b[' +
			color + 'm:status \x1b[0m:response-time ms - :res[content-length]\x1b[0m')
	}

	return fn(tokens, req, res)
});

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('custom'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});

// error handler
app.use(function(err, req, res, next) {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};

	// render the error page
	res.status(err.status || 500);
	res.render('error');
});

module.exports = app;