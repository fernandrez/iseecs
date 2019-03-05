'use strict';
const request = require('request');
const db = require('../db');
const utils = require('../utils');
const logger = require('../logger');
logger.info(__dirname.match(/([^\/]*)\/*$/)[1],'module loaded');

const cex = require('./cex');
const gdax = require('./gdax');
const lbtc = require('./lbtc');
const pxfl = require('./pxfl');

module.exports = {
  cex,
  gdax,
  lbtc,
  pxfl
}
