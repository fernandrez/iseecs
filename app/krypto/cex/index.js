'use strict';
const trades = require('./trades'),
    orderbook = require('./orderbook');

module.exports = {
  syncTrades: trades.syncTrades,
  syncOrderbook: orderbook.syncOrderbook
}
