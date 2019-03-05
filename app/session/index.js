'use strict';
const session = require('express-session');
const logger = require('../logger');
const MongoStore = require('connect-mongo')(session);
const config = require('../config');
const db = require('../db');

logger.info(__dirname.match(/([^\/]*)\/*$/)[1],'module loaded');

if(process.env.NODE_ENV === 'production'){
  module.exports = session({
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({
      mongooseConnection: db.Mongoose.connection
    })
  });
} else {
  module.exports = session({
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: true
  });
}
