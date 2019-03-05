'use strict';

const logger = require('../../logger'),
  db = require('../../db'),
  lbtc_sync = require('./lbtc_sync'),
  lbtc_utils = require('./lbtc_utils'),
  lbtc_const = require('./lbtc_const');

const bank_strings = ['banco:', 'bank:', 'cuenta:','account:']
const thank_strings = ['calificación positiva']

const automessagesIndex = {bank_details: 0}

var automessages = [
  {
    key: 'bank_details',
    condition: (trade) => {
      var hasBankAccount = true;
      if(trade.is_selling && !trade.payment_completed_at){
        hasBankAccount = false;
        //check messages including Banco, Bank, Cuenta, Account
        if(trade.messages){
          trade.messages.forEach((m, i) => {
            bank_strings.forEach((b) => {
              if(m.msg.toLowerCase().indexOf(b) != -1){
                hasBankAccount = true;
              }
            });
          });
        }
      }
      return !hasBankAccount;
    },
    respond: (trade) => {
      return new Promise((resolve, reject) => {
        db.adlbtcModel.findOne({ ad_id: trade.advertisement.id })
          .then(ad => {
            logger.info("Respective ad found");
            db.bankModel.find({ countrycode: ad.countrycode, active: 1 })
              .then(banks => {
                logger.info("Respective banks found");
                const template = 'Gracias %user% por tu oferta, aquí están los datos de la cuenta:\n%data%';
                const rnd = Math.floor(Math.random() * banks.length);
                var bankDetails = JSON.stringify(banks[rnd],null,4);
                bankDetails = ''; banks[rnd]['_id'] = undefined;banks[rnd]['countrycode'] = undefined;banks[rnd]['active'] = undefined;
                const plainBank = JSON.parse(JSON.stringify(banks[rnd]));
                for(var attr in plainBank){
                  bankDetails += attr+': '+banks[rnd][attr]+'\n';
                }
                const username = trade.buyer.real_name ? trade.buyer.real_name : trade.buyer.username;
                const message = lbtc_utils.parseStr(template, {'%data%': bankDetails, '%user%': username});
                console.log(message);
                lbtc_utils.apiCall(lbtc_utils.parseStr(lbtc_const.apiUrls.contact.message_post,{'%c%': trade.contact_id}),{msg: message})
                  .then(r => {
                    resolve(r);
                  })
                  .catch(e => { logger.error(e). reject(e); })
              })
              .catch(e => { logger.error(e). reject(e); })
          })
          .catch(e => { logger.error(e). reject(e); })
      })
    }
  },
  {
    key: 'thanks',
    condition: (trade) => {
      var hasThanks = true;
      if(trade.released_at){
        hasThanks = false;
        //check messages including Banco, Bank, Cuenta, Account
        if(trade.messages){
          trade.messages.forEach((m, i) => {
            thank_strings.forEach((b) => {
              if(m.msg.toLowerCase().indexOf(b) != -1){
                hasThanks = true;
              }
            });
          });
        }
      }
      return !hasThanks;
    },
    respond: (trade) => {
      return new Promise((resolve, reject) => {
        const template = 'Gracias %user% por confiar en nosotros, es usted digno de nuestra confianza y se le calificará positivamente. Por favor regálenos una calificación positiva con algún mensaje. Que tenga un buen día.';
        const username = trade.buyer.real_name ? trade.buyer.real_name : trade.buyer.username;
        const message = lbtc_utils.parseStr(template, {'%user%': username});
        console.log(message);
        lbtc_utils.apiCall(lbtc_utils.parseStr(lbtc_const.apiUrls.contact.message_post,{'%c%': trade.contact_id}),{msg: message})
          .then(r => {
            resolve(r);
          })
          .catch(e => { logger.error(e). reject(e); })
      })
    }
  },
  {
    key: 'test',
    condition: (trade) => {
      return false;
    },
    respond: (trade) => {
      return new Promise((resolve, reject) => {
        lbtc_utils.apiCall(lbtc_utils.parseStr(lbtc_const.apiUrls.contact.message_post,{'%c%': trade.contact_id}),{msg: 'Mensaje de prueba'})
          .then(r => {
            resolve(r);
          })
          .catch(e => { logger.error(e). reject(e); })
      })
    }
  }
]

let autorespond = () => {
  return new Promise((resolve, reject) => {
    lbtc_sync.syncTrades(lbtc_const.apiUrls.dashboard.open)
      .then(trades => {
        logger.info("Trades", trades);
        var trades_respond = [];
        trades.forEach((trade, i) => {
          automessages.forEach(am => {
            if(am.condition(trade) == true){
              trades_respond.push({trade, rfn: am.respond});
            }
          });
        })
        var result = Promise.resolve();
        trades_respond.forEach(tr => {
          result = result.then(() => tr.rfn(tr.trade));
        });
      })
      .catch(e=>{logger.error(e); reject(r);})
  });
}

module.exports = {
    autorespond
}
