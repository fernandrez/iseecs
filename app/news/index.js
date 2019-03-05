'use strict';
const config = require('../config');
const logger = require('../logger');
const utils = require('../utils');
const db = require('../db');

var FB = require('fb');
var fb = new FB.Facebook({ version: 'v2.9' })
const fbpostLimit = 100;
const googleLimit = 15;
const fbpostPage = 5;

logger.info(__dirname.match(/([^\/]*)\/*$/)[1],'module loaded');

let getBatchPosts = (page, postAfter = '', count = 0) => {
  return fb.api(
    '322209721190489/feed',
    {
      access_token: config.fb.clientID+"|"+config.fb.clientSecret,
      fields: ['id','admin_creator','application','call_to_action','caption','created_time','description',
        'feed_targeting','from','icon','instagram_eligibility','is_hidden','is_instagram_eligible','is_published',
        'link','message','message_tags','name','object_id','parent_id','permalink_url','picture','place','privacy',
        'properties','shares','source','status_type','story','story_tags','targeting','to','type','updated_time','with_tags',],
      limit: fbpostLimit,
      after: postAfter
    })
    .then(res => {
      return new Promise((resolve, reject) => {
        if(!res.error){
          return findFbPosts(res)
            .then(values => {
              if(saveFbPosts(res, values) && values.length == fbpostLimit){
                resolve(getBatchPosts(page, res.paging.cursors.after, ++count));
              } else {
                //if this is the last post
                resolve(utils.fbpost.findPaginated(page, fbpostPage));
              }
            })
            .catch(error => { logger.error('Error retireving post from DB',error); reject(error); });
        } else {
          logger.error('Error calling the Facebook API',res.error);
          reject(res.error);
        }
      });
    })

    .catch(error => { logger.error('Error calling Facebook API',error); reject(error); });;
}

var FeedParser = require('feedparser');
var request = require('request');
const i18n = require('i18n');

module.exports = {
  fbpostPage,
  iseeci_posts: (page) => {
    return getBatchPosts(page)
  },
  iseeci_posts_local: (page) => {
    return utils.fbpost.findPaginated(page, fbpostPage)
  },
  google_news: (r) => {
    var locale = i18n.getLocale()=='es'?'es_co':i18n.getLocale();
    logger.info("Getting info from Google News");
    logger.info(locale);
    //var urlGoogle='http://news.google.com/?output=rss&topic=t&num='+googleLimit+'&ned='+(locale=='es'?'es_co':locale);
    //var urlGoogle='https://news.google.com/news/rss/headlines/section/topic/SCITECH.'+locale+'/?ned='+locale;
    var urlGoogle = "https://news.google.com/news/rss/headlines/section/topic/TECHNOLOGY";

    var req = request(urlGoogle)
    var feedparser = new FeedParser();
    var fullResponse = [];
    req.on('error', function (error) {
      logger.error(error);
    });

    req.on('response', function (res) {
      var stream = this; // `this` is `req`, which is a stream

      if (res.statusCode !== 200) {
        this.emit('error', new Error('Bad status code, did not get anything from Google'));
      }
      else {
        stream.pipe(feedparser);
      }
    });

    feedparser.on('error', function (error) {
      console.log(error);
    });

    feedparser.on('readable', function(){
      var stream = this; // `this` is `feedparser`, which is a stream
      var meta = this.meta; // **NOTE** the "meta" is always available in the context of the feedparser instance
      var item;
      while (item = stream.read()) {
        var date = new Date(item.date);
        var mm = date.getMonth() + 1; // getMonth() is zero-based
        var dd = date.getDate();
        item.date = [date.getFullYear(),
          (mm>9 ? '' : '0') + mm,
          (dd>9 ? '' : '0') + dd
        ].join('-');
        fullResponse.push(item);
      }
      stream.fullResponse = fullResponse;
    });

    feedparser.on('end', r);
  }
}

let findFbPosts = res => {
  var ret = false;
  var fPromises = [];
  for(var i = 0; i < res.data.length; i++){
    if(res.data[i].id){
      fPromises[i] = utils.fbpost.findOne(res.data[i].id);
    }
  }
  return Promise.all(fPromises)
}

let saveFbPosts = (res, values) => {
  for( var i = 0; i < values.length; i++){
    if(!values[i]){
      utils.fbpost.create(res.data[i])
        .then(n => { logger.log('info','Post created: ' + n); })
        .catch(error => { logger.error('Error when creating new post: ', error) });
    } else {
      return false;
    }
  }
  return true;
}
