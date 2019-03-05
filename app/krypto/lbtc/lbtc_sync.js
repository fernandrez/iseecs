'use strict';
const logger = require('../../logger'),
 fs = require('fs'),
 utils = require('../../utils'),
 lbtc_const = require('./lbtc_const'),
 lbtc_utils = require('./lbtc_utils');

let syncAds = (c, t) => {
  return new Promise((resolve, reject) => {
    lbtc_utils.apiCall(lbtc_const.apiUrls.ads, {})
      .then(ads => {
        var retAds = [];
        ads.data.ad_list.forEach((ad, i) => {
          ad.index = null;
          utils.adlbtc.findOneAndUpdate(ad.data)
            .then(adu => {
              logger.info("Ad upserted:", ad.data.ad_id);
            })
            .catch(e=> { logger.error(e); reject(e); });
          if((!c || ad.data.countrycode == c) && (!t || ad.data.trade_type == lbtc_const.trade_types[t])){ retAds.push(ad.data); }
          resolve(retAds);
        });
      })
      .catch(e => { logger.error(e); reject(e); });
  })
}

let syncTrades = (url, retTrades) => {
  return new Promise((resolve, reject) => {
    if(!url) url = lbtc_const.apiUrls.dashboard.released;
    if(!retTrades) retTrades = [];
    var keep = true;
    lbtc_utils.apiCall(url, {})
      .then(trades => {
        logger.info("Retrieved trades:", trades.data.contact_list.length);
        if(trades.data.contact_count > 0){
          syncMessages2(trades.data.contact_list, 0)
          .then( retTMessages => {
            retTMessages.forEach(rtm => { retTrades.push(rtm); })
            if(trades.pagination && trades.pagination.next){
              resolve(syncTrades(trades.pagination.next.replace('https://localbitcoins.com/',''), retTrades));
            } else {
              resolve(retTrades);
            }
          })
          .catch(e => { logger.error(e); reject(e); });
        } else {
          resolve([]);
        }
      })
      .catch(e => { logger.error(e); reject(e); });
  })
}

let syncMessages2 = (trades) => {
  return new Promise((resolve, reject) => {
    var proChain = Promise.resolve();
    trades.forEach((t, i)=> {
      var trade = t.data;
      proChain = proChain
        .then(
          () => {
            logger.info("Info call: ", lbtc_utils.parseStr(lbtc_const.apiUrls.contact.messages, {'%c%': trade.contact_id}));
            return lbtc_utils.apiCall(lbtc_utils.parseStr(lbtc_const.apiUrls.contact.messages, {'%c%': trade.contact_id}));
          }
        )
        .catch(e => {
          logger.info("Info error: ", lbtc_utils.parseStr(lbtc_const.apiUrls.contact.messages, {'%c%': trade.contact_id}));
          logger.error("Error retrieving messages: ", e); reject(e);
        })
        .then(
          messages => {
            if(messages && messages.data){
              logger.info("Retrieved messages for",trade.contact_id,":", messages.data.message_list.length);
              if(messages.data.message_list && messages.data.message_list.length > 0){
                trades[i].messages = messages.data.message_list;
              }
              return downloadImages(messages);
            }
          }
        )
        .catch(e => {logger.error("Error retrieving attachments: ", e); reject(e); })
        .then((attachments) => {
          trade.attachments = attachments;
          utils.tradelbtc.findOneAndUpdate(trade)
            .then(adu => {
              logger.info("Trade upserted:", trade.contact_id);
            })
            .catch(e => { logger.error("Error upserting trade: ", e);; reject(e); });
        })
        .catch(e => {logger.error("Error unknown: ", e); reject(e); });
    });
    proChain.then((attachments) => resolve(trades))
  });
}

let downloadImages = (messages) => {
  return new Promise((resolve, reject) => {
    var proChain = Promise.resolve();
    var attachments = [];
    messages.data.message_list.forEach((m, i) => {
      if(m.attachment_type == 'image/png'){
        proChain = proChain
          .then(()=>{
            attachments.push(m.attachment_url.replace('https://localbitcoins.com/',''));
            return lbtc_utils.apiCall(m.attachment_url.replace('https://localbitcoins.com/',''))
          })
          .catch(e => { logger.error("Error retrieving attachment: ", e); reject(e); })
          .then(attachment => {
            logger.info(m);
            fs.writeFile('images/'+m.created_at+'-'+m.sender.username+' '+m.attachment_name, attachment, 'binary', function(err){
                if (err) throw err
                logger.info('File saved.')
            })
            logger.info("Attachment: ");
          })
          .catch(e => { logger.error("Error saving attachment: ", e); reject(e); });
      }
    });
    proChain
      .then(() => resolve(attachments))
      .catch(e => { logger.error("Error downloading images", e); reject(e); });
  });
}

let syncMessages = (trades, i, retTrades) => {
  return new Promise((resolve, reject) => {
    if(i < trades.length && trades[i]){
      if(!retTrades || retTrades.length == 0){
        retTrades =  [];
      }
      var trade = trades[i].data;
      lbtc_utils.apiCall(lbtc_utils.parseStr(lbtc_const.apiUrls.contact.messages, {'%c%': trade.contact_id}))
        .then(messages => {
          logger.info("Retrieved messages for",trade.contact_id,":", messages.data.message_list.length);
          trade.messages = messages.data.message_list;
          /*var proChain = Promise.resolve();
          messages.data.message_list.forEach((m, i) => {
            if(m.attachment_type == 'image/png'){
              proChain
                .then(()=>{
                  lbtc_utils.apiCall(m.attachment_url.replace('https://localbitcoins.com/',''))
                })
                .then(attachment => {
                  logger.info("Attachment: ", attachment);
                })
                .catch(e=> { logger.error("Error retrieving attachment: ",e); reject(e); });
            }
          });*/
          utils.tradelbtc.findOneAndUpdate(trade)
            .then(adu => {
              logger.info("Trade upserted:", trade.contact_id);
            })
            .catch(e=> { logger.error(e); reject(e); });
            retTrades.push(trade);
            resolve(syncMessages(trades, ++i, retTrades));
        })
        .catch(e => { logger.error(e); reject(e); });
      } else {
        resolve(retTrades);
      }
  })
}

module.exports=({
  syncAds,
  syncTrades
});
