'use strict';

const logger = require('../logger'),
  krypto = require('../krypto');

 let validateParams = (params) => {
   var c = null, t = null, p = null, state = null;
   if(params.cc){
    c = params.cc.toUpperCase();;
   }
   if(params.tt){
    t = params.tt.toLowerCase();;
   }
   if(params.pp){
     p = params.pp;
     if(params.pp != 'call'){
       p = +p;
     }
   }
   if(params.state){
     state = params.state;
   }
   return {c, t, p, state};
 }

let syncTrades = (req, res, next) => {
  krypto.cex.syncTrades()
    .then(trades => {
      logger.info(trades);
    })
    .catch(e => logger.error("Error syncing trades outside", e));
  res.send('Triggered');
};

let syncOrderbook = (req, res, next) => {
 krypto.cex.syncOrderbook()
   .then(orders => {
     //logger.info(orders);
   })
   .catch(e => logger.error("Error syncing orders outside", e));
 res.send('Triggered');
};

module.exports = {
  syncTrades,
  syncOrderbook
}
