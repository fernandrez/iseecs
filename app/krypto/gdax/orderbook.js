'use strict';

const Gdax = require('gdax'),
    logger = require('../../logger'),
    utils = require('../../utils');

const pairs = ['BTC-USD','ETH-USD','ETH-BTC'];
let orderbookSync = new Gdax.OrderbookSync(pairs);

let syncOrderbook = () => {
  if(orderbookSync.books[pairs[0]].state().asks){
    orderbookSync.books[pairs[0]].state().asks.forEach(p=>{
      console.log(p)
    })
  }
  return Promise.resolve();
}

module.exports = {
  syncOrderbook
}
