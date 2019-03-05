'use strict';
const trades = require('./trades'),
    orderbook = require('./orderbook');

module.exports = {
  syncOrderbook: orderbook.syncOrderbook
}
