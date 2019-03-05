'use strict';

const request = require('request-promise-native'),
    logger = require('../../logger'),
    utils = require('../../utils');

const baseUrl = 'https://cex.io/api/order_book/',
    pairs = ['BTC/USD','ETH/USD','ETH/BTC'],
    qs = {depth: 10};

let syncOrderbook = () => {
  return new Promise((resolve, reject) => {
    let proReq = Promise.resolve();
    pairs.forEach(p => {
      proReq = proReq
        .then(() => {
          logger.info(baseUrl + p);
          return request.get({url: baseUrl + p + "/", qs:qs})
        })
        .catch((e)=>logger.info("Unexpected Error", e))
        .then((data)=> {
          var jsonData = JSON.parse(data);
          logger.info(jsonData.pair);
          return utils.orderbookcex.rawInsert(jsonData)
        })
        .catch((error) => {
          logger.info("Error performing the request", error)
        })
        .then((r)=>logger.info("Orderbook record created", r.pair))
        .catch(e=>logger.info("Error creating orderbook record", e))
    });
  });
}

module.exports = {
  syncOrderbook
}
