'use strict';
const logger = require('../../logger'),
 lbtc_const = require('./lbtc_const'),
 lbtc_utils = require('./lbtc_utils'),
 lbtc_sync = require('./lbtc_sync'),
 lbtc_position = require('./lbtc_position'),
 lbtc_message = require('./lbtc_message'),
 cron = require('cron');

var monitor_job = new cron.CronJob({
  cronTime: '* * * * *',
  onTick: function() {
    lbtc_position.reposition();
  },
  start: false,
  timeZone: 'America/Buenos_Aires'
});


module.exports=({
  defaults: lbtc_const.defaults,
  price: lbtc_utils.price,
  position: lbtc_position.position,
  disable: lbtc_utils.disable,
  enable: lbtc_utils.enable,
  syncTrades: lbtc_sync.syncTrades,
  syncAds: lbtc_sync.syncAds,
  autorespond: lbtc_message.autorespond,
  reposition: lbtc_position.reposition,
  monitor_job
});
