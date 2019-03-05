'use strict';
const config = require('../config');
const logger = require('../logger');
const nodemailer = require('nodemailer');

logger.info(__dirname.match(/([^\/]*)\/*$/)[1],'module loaded');

// create reusable transporter object using the default SMTP transport
let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: config.gmail
});

module.exports = {
  transporter
}
