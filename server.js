'use strict';
const express = require('express'),
      app = express(),
      iseeci = require('./app'),
      db = require('./app/db'),
      passport = require('passport'),
      cookieParser = require('cookie-parser'),
      bodyParser = require('body-parser'),
      i18n = require('i18n'),
      nodemailer = require('nodemailer');

app.set('port', process.env.PORT || 3000);
app.use(express.static('public'));
app.set('view engine', 'ejs');

// i18n
i18n.configure({
  locales: ['en', 'es'],
  cookie: 'iseeci-language',
  directory: __dirname + '/locales'
});
// expose cookies to req.cookies
app.use(cookieParser());
app.use(i18n.init);

app.use(iseeci.session);
app.use(passport.initialize());
app.use(passport.session());
app.use(require('morgan')('combined',{
  'stream': {
    write: message => {
      iseeci.logger.log('info', message);
    }
  }
}));

app.use('/js', express.static(__dirname + '/node_modules/bootstrap/dist/js')); // redirect bootstrap JS
app.use('/js', express.static(__dirname + '/node_modules/jquery/dist')); // redirect JS jQuery
app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css')); // redirect CSS bootstrap

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())

// retrieve the site menu
app.use('/site', iseeci.menu.menu);
app.use('/site/:code', iseeci.menu.element);
app.use('/', iseeci.router);
/*
// process events
process.once('SIGUSR2', function() {
	shutdown(process.exit);
});
process.on('SIGINT', function() {
	shutdown(process.exit);
});
process.on('SIGTERM', function() {
	shutdown(process.exit);
});
process.on('exit', function() {
	shutdown();
});
function shutdown(callback) {
  db.Mongoose.connection.close();
  callback && callback();
}*/
app.listen(app.get('port'), () => {
  iseeci.logger.log('iSeeCI Running')
});
