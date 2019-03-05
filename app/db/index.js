'use strict';
const config = require('../config');
const logger = require('../logger');
const Mongoose = require('mongoose').connect(config.dbURI);
const MongoosePaginate = require('mongoose-paginate');
Mongoose.Promise = global.Promise;

logger.info(__dirname.match(/([^\/]*)\/*$/)[1],'module loaded');

Mongoose.connection.on('error', error => {
  logger.log('error',"MongoDB Error: " + error);
})

const user = new Mongoose.Schema({
  profileId: String,
  fullName: String,
  profilePic: String
});
let userModel = Mongoose.model('user', user);

const element = new Mongoose.Schema({
  parent: String,
  codigo: String,
  titulo: String,
  subtitulo: String,
  descripcion: String,
  has_children: Boolean,
  con_link: String,
  link: String,
  metatags: Object
}, { collection: 'elements' });
let elementModel = Mongoose.model('elements', element);

const contact = new Mongoose.Schema({
  name: String,
  email: String,
  mobile: String,
  subject: String
}, { collection: 'contacts' });
let contactModel = Mongoose.model('contacts', contact);

const fbpost = new Mongoose.Schema({
  fid: String,
  admin_creator: [Object],
  app: Object,
  call_to_action: Object,
  caption: String,
  created_time: Date,
  description: String,
  feed_targeting: Object,
  from: Object,
  icon: String,
  instagram_eligibility: String,
  is_hidden: Boolean,
  is_instagram_eligible: String,
  is_published: Boolean,
  link: String,
  message: String,
  message_tags: Object,
  name: String,
  Object_id: String,
  parent_id: String,
  permalink_url: String,
  picture: String,
  place: Object,
  privacy: Object,
  properties: [Object],
  shares: Object,
  source: String,
  status_type: String,
  story: String,
  story_tags: [String],
  targeting: Object,
  to: Object,
  type: String,
  updated_time: Date,
  with_tags: Object,
}, { collection: 'fbposts' });
fbpost.plugin(MongoosePaginate);
let fbpostModel = Mongoose.model('fbposts', fbpost);

const tradecex = new Mongoose.Schema({
  pair: String,
  type: String,
  date: String,
  amount: Number,
  price: Number,
  tid: Number
}, { collection: 'trades.cex' });
let tradecexModel = Mongoose.model('trades.cex', tradecex);

const orderbookcex = new Mongoose.Schema({
  pair: String,
  id: Number,
  sell_total: Number,
  buy_total: Number,
  timestamp: Number,
  bids: [[Number]],
  asks: [[Number]]
}, { collection: 'orderbooks.cex' });
let orderbookcexModel = Mongoose.model('orderbooks.cex', orderbookcex);

const orderbookgdax = new Mongoose.Schema({
  pair: String,
  id: Number,
  sell_total: Number,
  buy_total: Number,
  timestamp: Number,
  bids: [[Number]],
  asks: [[Number]]
}, { collection: 'orderbooks.gdax' });
let orderbookgdaxModel = Mongoose.model('orderbooks.gdax', orderbookgdax);

const adlbtc = new Mongoose.Schema({
  index: String,
  profile: Object,
  require_feedback_score: Number,
  hidden_by_opening_hours: Boolean,
  trade_type: String,
  ad_id: Number,
  temp_price: Number,
  bank_name: String,
  payment_window_minutes: Number,
  trusted_required: Boolean,
  min_amount: Number,
  account_info: String,
  visible: Boolean,
  require_trusted_by_advertiser: Boolean,
  track_max_amount: Boolean,
  temp_price_usd: Number,
  lat: Number,
  age_days_coefficient_limit: Number,
  price_equation: String,
  is_local_office: Boolean,
  first_time_limit_btc: Number,
  atm_model: String,
  city: String,
  location_string: String,
  countrycode: String,
  currency: String,
  limit_to_fiat_amounts: Number,
  created_at: Date,
  max_amount: Number,
  lon: Number,
  is_low_risk: Boolean,
  sms_verification_required: Boolean,
  require_trade_volume: Number,
  online_provider: String,
  max_amount_available: Number,
  opening_hours: String,
  msg: String,
  require_identification: Boolean,
  email: String,
  volume_coefficient_btc: Number
}, { collection: 'ads.lbtc' });
let adlbtcModel = Mongoose.model('ads.lbtc', adlbtc);

const tradelbtc = new Mongoose.Schema({
  created_at: Date,
  buyer: Object,
  seller: Object,
  reference_code: String,
  currency: String,
  amount: Number,
  amount_btc: Number,
  fee_btc: Number,
  exchange_rate_updated_at: Date,
  advertisement: Object,
  contact_id: Number,
  canceled_at: Date,
  escrowed_at: Date,
  funded_at: Date,
  payment_completed_at: Date,
  disputed_at: Date,
  closed_at: Date,
  released_at: Date,
  is_buying: Boolean,
  is_selling: Boolean,
  account_details: String,
  account_info: String,
  floating: Boolean,
  messages: [String]
}, { collection: 'trades.lbtc' });
let tradelbtcModel = Mongoose.model('trades.lbtc', tradelbtc);

const bank = new Mongoose.Schema({
  banco: String,
  bank: String,
  cuenta: String,
  account: String,
  cbu: String,
  dni: String,
  cc: String,
  cuil: String,
  nombre: String,
  name: String,
  countrycode: String,
  active: Number
}, { collection: 'banks' });
let bankModel = Mongoose.model('banks', bank);

module.exports = {
  Mongoose,
  userModel,
  elementModel,
  contactModel,
  fbpostModel,
  tradecexModel,
  orderbookcexModel,
  tradelbtcModel,
  adlbtcModel,
  bankModel
}
