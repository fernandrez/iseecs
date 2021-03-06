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

let syncOrderbook = (req, res, next) => {
 krypto.gdax.syncOrderbook()
   .then(orders => {
     //logger.info(orders);
   })
   .catch(e => logger.error("Error syncing orders outside", e));
 res.send('Triggered');
};

module.exports = {
  syncOrderbook
}
