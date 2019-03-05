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

let position = (req, res, next) => {
  var v = validateParams(req.params);
  var ret;
  if(krypto.lbtc.defaults.hasOwnProperty(v.c)){
   krypto.lbtc.position(v.c, v.t, v.p)
     .then(data => { logger.info('Ads Positioned:',data); })
     .catch(error =>{ logger.error('Error Positioning Ads:',error) });
     ret = 'Triggered';
  } else {
   ret = 'Please check the country code';
  }
  res.send(ret);
 };

let price = (req, res, next) => {
  var v = validateParams(req.params);
  krypto.lbtc.price(v.c, v.t, v.p)
    .then(ads => {
      logger.info(ads);
    })
    .catch(e => logger.error(e));
  res.send('Triggered');
}

let disable = (req, res, next) => {
  var v = validateParams(req.params);
  krypto.lbtc.disable(v.c, v.t)
    .then(ads => {
      logger.info(ads);
    })
    .catch(e => logger.error(e));
  res.send('Triggered');
}

let enable = (req, res, next) => {
  var v = validateParams(req.params);
  krypto.lbtc.enable(v.c, v.t)
    .then(ads => {
      logger.info(ads);
    })
    .catch(e => logger.error("Error enabling ads", e));
  res.send('Triggered');
}

let autorespond = (req, res, next) => {
  var v = validateParams(req.params);
  krypto.lbtc.autorespond()
    .then(messages => {
      logger.info("AA:",messages);
    })
    .catch(e => logger.error(e));
  res.send('Triggered');
}

let syncTrades = (req, res, next) => {
  krypto.lbtc.syncTrades()
    .then(trades => {
      logger.info(trades);
    })
    .catch(e => logger.error("Error syncing trades outside", e));
  res.send('Triggered');
};

let syncAds = (req, res, next) => {
  krypto.lbtc.syncAds()
    .then(ads => {
      logger.info(ads);
    })
    .catch(e => logger.error("Error syncing ads", e));
  res.send('Triggered');
};

let monitor = (req, res, next) => {
  var v = validateParams(req.params);
  if(v.state == 'on'){
    krypto.lbtc.reposition();
    krypto.lbtc.monitor_job.start();
  } else {
    krypto.lbtc.monitor_job.stop();
  }
  res.send('Triggered');
};

module.exports = {
  monitor,
  position,
  price,
  disable,
  enable,
  autorespond,
  syncTrades,
  syncAds
}
