'use strict';

const router = require('express').Router();
const logger = require('../logger');
const db = require('../db');

logger.info(__dirname.match(/([^\/]*)\/*$/)[1],'module loaded');

let _registerRoutes = (routes, method) => {
  for(let key in routes){
    if(typeof routes[key] === 'object' && routes[key] !== null && !(routes[key] instanceof Array)) {
      _registerRoutes(routes[key], key);
    } else {
      if(method === 'get') {
        router.get(key, routes[key]);
      } else if(method === 'post') {
        router.post(key, routes[key]);
      } else {
        router.use(routes[key]);
      }
    }
  }
}

let route = routes => {
  _registerRoutes(routes);
  return router;
}

let user = require('./user');

let element = require('./element');

let contact = require('./contact');

let fbpost = require('./fbpost');

let tradecex = require('./tradecex');

let orderbookcex = require('./orderbookcex');

let adlbtc = require('./adlbtc');

let tradelbtc = require('./tradelbtc');

let isAuthenticated = (req, res, next) => {
  if(req.isAuthenticated()) {
    next();
  } else {
    res.redirect('/site/login');
  }
}

let validator = {
  minOne: (page) => {
    if(!page || page < 1)
      page = 1;
    return parseInt(page);
  }
}

module.exports = {
  route,
  user,
  element,
  contact,
  fbpost,
  adlbtc,
  tradelbtc,
  tradecex,
  orderbookcex,
  isAuthenticated,
  validator
}
