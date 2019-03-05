'use strict';
const logger = require('../logger');
logger.info(__dirname.match(/([^\/]*)\/*$/)[1],'module loaded');
if(process.env.NODE_ENV === 'production') {
  modules.exports = {
    host: process.env.host || "",
    dbURI: process.env.dbURI,
    sessionSecret: process.env.sessionSecret,
    fb: {
      clientID: process.env.fbClientID,
      clientSecret: process.env.fbClientSecret,
      callbackUrl: process.env.host + "/auth/facebook/callback",
      profileFields: ["id", "displayName", "photos", "email"]
    },
    twitter: {
      consumerKey: process.env.twConsumerKey,
      consumerSecret: process.env.twConsumerSecret,
      callbackUrl: process.env.host + "/auth/twitter/callback",
      profileFields: ["id", "displayName", "photos", "email"]
    },
    google: {
      clientID: process.env.gClientID,
      clientSecret: process.env.gClientSecret,
      callbackUrl: process.env.host + "/auth/facebook/callback",
      profileFields: ["id", "displayName", "photos", "email"]
    }
  }
} else {
  logger.log('info',"Loading development.json...");
  module.exports = require('./development.json');
}
