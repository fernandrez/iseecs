'use strict';

const onlineSell = 'ONLINE_SELL', onlineBuy = 'ONLINE_BUY';
const trade_types = { sell: onlineSell, buy: onlineBuy}
var trade_types_opposite = {sell: onlineBuy, buy: onlineSell}
var trade_types_inverse=[];trade_types_inverse[onlineSell] = 'sell'; trade_types_inverse[onlineBuy] = 'buy';
const apiUrls = {
    sell: 'buy-bitcoins-online/%c%/%n%/%pt%',
    buy: 'sell-bitcoins-online/%c%/%n%/%pt%',
    ads: 'api/ads/',
    dashboard: { open: 'api/dashboard/',released: 'api/dashboard/released/' },
    contact: { messages: 'api/contact_messages/%c%/', message_post: 'api/contact_message_post/%c%/' }
}
const lbtcusers = { iseebtc: true };
const defaults = {
  CO: {
    lower: 'co',
    name: 'colombia',
    lat: '6.2518400',
    lon: '-75.5635900',
    city: 'Medellín',
    currency: 'COP',
    payment_types: { sell: '.json', buy: 'national-bank-transfer/.json'}
  },
  AR: {
    lower: 'ar',
    name: 'argentina',
    lat: '-34.61315',
    lon: '-58.37723',
    city: 'Buenos Aires',
    currency: 'ARS',
    payment_types: { sell: 'national-bank-transfer/.json', buy: 'national-bank-transfer/.json'}
  },
  US: {
    lower: 'us',
    name: 'united-states',
    lat: '25.7742700',
    lon: '-80.1936600',
    city: 'Miami',
    currency: 'USD',
    payment_types: { sell: '.json', buy: 'national-bank-transfer/.json'}
  },
}

module.exports = {
  apiUrls,
  defaults,
  trade_types,
  trade_types_opposite,
  trade_types_inverse,
  lbtcusers
}
