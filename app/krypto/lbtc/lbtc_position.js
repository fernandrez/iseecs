'use strict';
const logger = require('../../logger'),
 db = require('../../db'),
 utils = require('../../utils'),
 lbtc_utils = require('./lbtc_utils'),
 lbtc_const = require('./lbtc_const'),
 lbtc_sync = require('./lbtc_sync');

let position = (c, t, p) => {
  return new Promise((resolve, reject) => {
    if (t == 'sell' || t == 'buy') {
      let syncPromise = lbtc_sync.syncAds(c, t);
      let positionPromise = positionSingle(c, t, p);
      Promise.all([syncPromise, positionPromise])
        .then((values) => {
          logger.info("Own bitcoin ads synced:", values[0].length);
          //Check price limits
          db.adlbtcModel.find({ countrycode: c, trade_type: lbtc_const.trade_types_opposite[t] })
            .then(ads => {
              logger.info("Opposite ads found, checking price limits...")
              let validPrice = true;
              console.log("ads",ads);
              const price = (values[1].right + values[1].left) / 2.0;
              ads.forEach(ad => {
                let margin;
                if(t=='sell'){
                  margin = (price - ad.temp_price_usd) / price;
                } else {
                  margin = (ad.temp_price_usd - price) / ad.temp_price_usd;
                }
                if(margin < 0.03){
                  validPrice = false;
                }
                logger.info("Was the price valid?", [price,ad.temp_price_usd,validPrice]);
              });
              let updates = [];
              if(validPrice){
                updates = lbtc_utils.adjustEquations(values[0], values[1]);
              }
              if(updates.length > 0){
                resolve(lbtc_utils.updateAd(updates, 0));
              } else {
                resolve(updates);
              }
            })
            .catch(e => { reject("Error finding opposite ads", e); logger.error(e); });
        })
        .catch(e=>{logger.error(e); reject(e);});
    } else {
      logger.error("Transaction not implemented")
      return new Promise((resolve, reject) => {
        reject("Transaction type not implemented");
      })
    }
  })
};

let positionSingle = (c, t, p) => {
  return new Promise((resolve, reject) => {
    const pars = {'%c%': lbtc_const.defaults[c].lower, '%n%': lbtc_const.defaults[c].name, '%pt%': lbtc_const.defaults[c].payment_types[t] }
    lbtc_utils.apiCall(lbtc_utils.parseStr(lbtc_const.apiUrls[t], pars))
      .then(adslocal => {
        logger.info("Ads from LBTC retrieved:", adslocal.data.ad_list.length);
        const filtered = filter(adslocal.data.ad_list);
        const position = process(filtered, t, p);
        resolve(position);
      })
      .catch(e => { logger.error("Error contacting LocalBitcoins", e); reject(e); })
  });
}

let positionBoth = (c, p, syncPromise) => {
  return new Promise((resolve, reject) => {
    positionSingle(c, 'sell', p, syncPromise)
      .then(positionedSell => {
        positionSingle(c, 'buy', p, syncPromise)
          .then(positionedBuy => {
            logger.info("Sell and Buy Ads positioned");
          })
          .catch(e => {logger.error(e); reject(e);})
      })
      .catch(e => {logger.error(e); reject(e);})
  });
}
//todo: aqui debe generarse un retAds dividido en los diferentes tipos de pago
let filter = (adslocal) => {
  const minLen = adslocal.length;
  var retAds = [];
  for(var i = 0; i < minLen; i++){
    if(!lbtc_const.lbtcusers.hasOwnProperty(adslocal[i].data.profile.username) && //No sea el propio ni el que esta en dolares y no es de usa
    (adslocal[i].data.countrycode == 'US' || (adslocal[i].data.countrycode != 'US' && adslocal[i].data.temp_price != adslocal[i].data.temp_price_usd))){
      retAds.push(adslocal[i].data);
    }
  }
  logger.info("Ads filtered");
  return retAds;
}

let process = (adslocal, t, p) => {
  var l, r, ll, rl;
    if(p != null && typeof p != undefined){
      if(p == 'call'){
          switch(t){
            case 'sell':
              l = +adslocal[0].temp_price_usd-0.1; r = +adslocal[0].temp_price_usd;
              ll = +adslocal[0].temp_price - 10; rl = +adslocal[0].temp_price;
              break;
            case 'buy':
              l = +adslocal[0].temp_price_usd, r = +adslocal[0].temp_price_usd+0.1;
              ll = +adslocal[0].temp_price; rl = +adslocal[0].temp_price + 10;
              break;
          }
      } else {
          p = Math.min(p, adslocal.length - 1);
          l = +adslocal[p].temp_price_usd, r = +adslocal[p + 1].temp_price_usd,
          ll = +adslocal[p].temp_price, rl = +adslocal[p + 1].temp_price;
      }
    }
    return { index: p, left: l, right: r, gap: r - l, leftLocal: ll, rightLocal: rl };
}

let reposition = () => {
  return new Promise((resolve, reject) => {
    db.adlbtcModel.find({ index: {$exists: true} })
      .then(my_ads => {
          resolve(positionIndexedAds(my_ads, 0));
      })
      .catch(e => { logger.error(e); reject(e); })
  });
};

let positionIndexedAds = (ads, i) => {
 return new Promise((resolve, reject) => {
   var ad = ads[i];
   lbtc_sync.syncAds(ad.countrycode, lbtc_const.trade_types_inverse[ad.trade_type])
    .then(()=>{
      positionSingle(ad.countrycode, lbtc_const.trade_types_inverse[ad.trade_type], ad.index)
        .then( position => {
          utils.adlbtc.findOne(ad.ad_id)
            .then( adu => {
              var updates = lbtc_utils.adjustEquations([adu], position);
              if(updates.length > 0){
                lbtc_utils.updateAd(updates, 0)
                  .then(() => {
                    if(++i < ads.length){
                      resolve(positionIndexedAds(ads, i));
                    } else {
                      resolve(updates);
                    }
                  })
                  .catch(e => {logger.error(e); reject(e);})
              } else {
                resolve([]);
              }
            })
            .catch(e => {logger.error(e); reject(e);})
        })
        .catch(e => {logger.error(e); reject(e);})
    })
    .catch(e => {logger.error(e); reject(e);})
 });
}

module.exports=({
  position,
  reposition
});
