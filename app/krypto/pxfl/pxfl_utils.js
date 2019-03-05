'use strict';
var logger = require('../../logger');
var config = require('../../config');
var db = require('../../db');
var utils = require('../../utils');
var PXFLClient = require('./pxfl_client');
var pxfl = new PXFLClient(config.pxfl.id, config.pxfl.secret);

let parseStr = (str, pars) => { return str.replace(/%\w+%/g, function(all) { return pars[all] || all; }) }

let apiCall = (endpoint, params) => {
  return new Promise((resolve, reject) => {
    pxfl.api(endpoint, params, function(error, data) {
        error = error || data.error;
        if(error || error) {
          reject(error);
        }
        else {
          resolve(data);
        }
    });
  });
}

let adjustEquations = (myads, position) => {
  const regex = /[+-]?\d+(\.\d+)?/g;
  const price = (position.right + position.left) / 2.0;
  var updates = [];
  myads.forEach((ad, i) => {
    const curMult = ad.price_equation.match(regex).map(function(v) { return parseFloat(v); })[1];
    ad.price_equation = '(btc_in_usd + bitfinexusd_avg + bitstampusd_avg + krakenusd_avg) * 0.25 * USD_in_'+lbtc_const.defaults[ad.countrycode].currency;
    if(curMult != undefined){
      var modMult;
      modMult =  curMult / ad.temp_price_usd * price;
      ad.price_equation += ' * ' + modMult;
    } else {
      ad.price_equation += ' * 1.0'
    }
    //if(modMult / curMult >= 0.7 && modMult / curMult <= 1.3){
      ad.index = position.index;
      pushUpdate(updates, ad);
    //}
  });
  logger.info("Update objects created: " + updates.length);
  return updates;
}

let pushUpdate = (update, u) => {
  update.push({
    ad_id: u.ad_id,
    price_equation: u.price_equation,
    lat: u.lat ? u.lat : lbtc_const.defaults[u.countrycode].lat,
    lon: u.lon ? u.lon : lbtc_const.defaults[u.countrycode].lon,
    city: u.city ? u.city : lbtc_const.defaults[u.countrycode].city,
    location_string: u.location_string ? u.location_string : ' ',
    countrycode: u.countrycode,
    currency: u.currency ? u.currency : lbtc_const.defaults[u.countrycode].currency,
    bank_name: u.bank_name ? u.bank_name : '',
    msg: u.msg ? u.msg : '',
    min_amount: u.min_amount,
    max_amount: u.max_amount,
    visible: u.visible,
    index: u.index
  });
}

let updateAd = (updates, i) => {
  console.log('api/ad/'+updates[i].ad_id+'/',updates[i])
  return new Promise((resolve, reject) => {
    logger.info("Updating " + updates[i].ad_id,'api/ad/'+updates[i].ad_id+'/');
    apiCall('api/ad/'+updates[i].ad_id+'/', updates[i])
      .then(value => {
        logger.info("Ad " + updates[i].ad_id + " updated in LBTC");
        utils.adlbtc.findOneAndUpdate(updates[i])
          .then(adold => {
            logger.info("Ad upserted:", updates[i].ad_id);
            if(++i < updates.length){
              resolve(updateAd(updates, i));
            } else {
              resolve(updates);
            }
          })
          .catch(e=> { logger.error("Error updating the database", e); reject(e); });
      })
      .catch(e => {logger.error("Error updating in Localbitcoins", e); reject(e);})
    });
}

let disable = (c, t) => {
  return new Promise((resolve, reject) => {
    db.adlbtcModel.find({ countrycode: c, trade_type: lbtc_const.trade_types[t] })
      .then(ads => {
        logger.info("Ads found, disabling ads...")
        var updates = updateField(ads, 'visible', false);
        resolve(updateAd(updates, 0))
      })
      .catch(e => { reject("Error finding ads to disable", e); logger.error(e); });
  });
}

let enable = (c, t) => {
  return new Promise((resolve, reject) => {
    db.adlbtcModel.find({ countrycode: c, trade_type: lbtc_const.trade_types[t] })
      .then(ads => {
        logger.info("Ads found, enabling ads...")
        var updates = updateField(ads, 'visible', true);
        resolve(updateAd(updates, 0))
      })
      .catch(e => { reject("Error finding ads", e); logger.error(e); });
  });
}

let updateField = (myads, field, value) => {
  var updates = [];
  myads.forEach((ad, i) => {
    ad[field] = value;
    pushUpdate(updates, ad);
  });
  logger.info("Update objects created: " + updates.length);
  return updates;
}

let price = (countrycode, type, price) => {
  return new Promise((resolve, reject) => {
    db.adlbtcModel.find({ countrycode: countrycode, trade_type: lbtc_const.trade_types[type] })
      .then(ads => {
        logger.info("Ads found, updating price equation...")
        var updates = adjustEquations(ads, price);
        resolve(updateAd(update, 0))
      })
      .catch(e => { logger.error("Error finding Ad", e); reject(e); });
  });
};

module.exports=({
  apiCall,
  adjustEquations,
  disable,
  enable,
  parseStr,
  price,
  pushUpdate,
  updateAd
});
