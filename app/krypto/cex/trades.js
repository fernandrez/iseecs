'use strict';

const request = require('request');
const db = require('../../db');
const utils = require('../../utils');
const logger = require('../../logger');
const cexbase = 'https://cex.io/api/trade_history/';
const pairs = ['BTC/USD','ETH/USD','ETH/BTC'];

let syncTrades = () => {
  return new Promise(( resolve, reject ) => {
    //do the same for each pair
    pairs.forEach(( pair ) => {
      // get the latest trades
      request.get( cexbase + pair, ( error, data ) => {
        if( error ) {
          logger.error( 'Error received from cex.io"', error );
          reject(error);
        } else {
          // parses the data
          var jsonData = JSON.parse(data.body);
          if(jsonData[0]){
            var lastCex = jsonData[0].tid;
            db.tradecexModel.findOne({pair: pair}).sort('-tid')
              .then(( member ) => {
                var since = 1;
                // checks if server needs to do something
                if(!member || member.tid < lastCex){
                  since = member ? member.tid : 1;
                  //Return promise that server will
                  //do everything request by request
                  resolve(saveTrades(pair, since, lastCex));
                }
              })
              .catch( e => {logger.error("No data received from cex.io for "+pair)});
          } else {
            logger.error("No data received from cex.io",data);
            reject(data);
          }
        }
      })
    });
  });
}


let saveTrades = (pair, since, lastCex) => {
  return new Promise((resolve, reject) => {
    request.get( cexbase + pair + '/?since='+since, ( error, data ) => {
      if( error ) {
        logger.log( 'error', 'Error requesting latest',pair,'data to cex.io',error );
        reject(error);
      } else {
        var jsonData = JSON.parse(data.body);
        if(jsonData[0] && jsonData[0].tid > since){
          var lastCexBatch = jsonData[0].tid;
          //Return promise that you will save all
          if(+jsonData[jsonData.length-1].tid <= +since ){
              jsonData.forEach(datum => {
                datum.pair = pair; datum.tid = +datum.tid;
                datum.amount = +datum.amount; datum.price = +datum.price;
              });
              db.tradecexModel.collection.insert(jsonData)
                .then(result => {
                  logger.log('info', pair+":",jsonData.length,'records appended from cex.io');
                })
                .catch(e => {logger.log('error','Error inserting',pair,'batch of',jsonData.length,'records from cex.io', e)});
              if(+lastCexBatch < +lastCex){
                resolve(saveTrades(pair, +lastCexBatch+1, lastCex));
              } else {
                resolve(0);
              }
          } else {
            resolve(saveTrades(pair, +since+1, lastCex));
          }
        } else {
          resolve(saveTrades(pair, +since+1000, lastCex));
        }
      }
    });
  });
}

module.exports = {
  syncTrades
}
