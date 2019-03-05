'use strict';
const passport = require('passport');
const config = require('../config');
const utils = require('../utils');
const logger = require('../logger');
const session = require('../session');
const FacebookStrategy = require('passport-facebook').Strategy;
const TwitterStrategy = require('passport-twitter').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
logger.info(__dirname.match(/([^\/]*)\/*$/)[1],'module loaded');
module.exports = () => {
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((id, done) => {
    utils.user.findById(id)
      .then(user => done(null, user))
      .catch(error => logger.error('Error deserializing user', error));
  });


  let authProcessor = (aT, rT, profile, done) => {
    // Find a user so we only fetch new ones
    //session.accessToken
    // Create new ones if not found
    utils.user.findOne(profile.id)
      .then(result => {
        if(result) {
          logger.info('User found');
          done(null, result);
        } else {
          utils.user.create(profile)
						.then(newUser => { logger.info('User created: ' + newUser); done(null, newUser); })
						.catch(error => logger.error('Error when creating new user: ' + error));/**/
        }
      })
      .catch(error => logger.error('Error finding user: ' + error));/**/;
  }

  passport.use(new FacebookStrategy(config.fb, authProcessor));
  passport.use(new TwitterStrategy(config.twitter, authProcessor));
  passport.use(new GoogleStrategy(config.google, authProcessor));
}
