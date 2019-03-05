'use strict';

const utils = require('../utils'),
 db = require('../db'),
 passport = require('passport'),
 fs = require('fs'),
 i18n= require('i18n'),
 logger = require('../logger'),
 news = require('../news'),
 mailer = require('../mailer'),
 krypto = require('../krypto'),
 siteUtils = require('./site'),
 lbtc = require('./lbtc'),
 cex = require('./cex'),
 gdax = require('./gdax');

logger.info(__dirname.match(/([^\/]*)\/*$/)[1],'module loaded');

module.exports = () => {
  let routes = {
    'get': {
      //Site
      '/': (req, res, next) => {
        res.redirect('/site/home');
      },
      '/site': (req, res, next) => {
        res.redirect('/site/home');
      },
      '/site/:view': siteUtils.viewOrElement,
      //Local
      '/local/sync/trades': lbtc.syncTrades,
      '/local/sync/ads': lbtc.syncAds,
      '/local/price/:cc/:tt/:pp': lbtc.price,
      '/local/position/:cc/:tt/:pp': lbtc.position,
      '/local/disable/:cc/:tt': lbtc.disable,
      '/local/enable/:cc/:tt': lbtc.enable,
      '/local/autorespond': lbtc.autorespond,
      '/local/monitor/:state': lbtc.monitor,
      //Cex
      '/cex/sync/trades': cex.syncTrades,
      '/cex/sync/orderbook': cex.syncOrderbook,
      //Gdax
      '/gdax/sync/orderbook': gdax.syncOrderbook,
      //Authentication
      '/site/login': (req, res, next) => {
        res.render('login', {menu: res.menu, user: req.user ? req.user : {fullName: 'guest', profilePic: '/img/site/guest.png'}});
      },
      '/auth/facebook': passport.authenticate('facebook'),
      '/auth/facebook/callback': passport.authenticate('facebook', { failureRedirect: '/', successRedirect: '/profile' }),
      '/auth/twitter': passport.authenticate('twitter'),
      '/auth/twitter/callback': passport.authenticate('twitter', { failureRedirect: '/', successRedirect: '/profile' }),
      '/auth/google': passport.authenticate('google', { scope: ['profile'] }),
      '/auth/google/callback': passport.authenticate('google', { failureRedirect: '/', successRedirect: '/profile' }),
      '/logout': (req, res, next) => {
        req.logout();
        res.redirect('/site/home');
      },
      '/a/google/news': (req, res, next) => {
        function googleReadableCB(){
          res.render('partials/google_news',{news: this.fullResponse});
        }
        news.google_news(googleReadableCB);
      },
      '/facebook/posts': (req, res, next) => {
        var page = utils.validator.minOne(req.query.page);
        news.iseeci_posts_local(page)
          .then(posts => {
            res.render('partials/facebook_posts', {page: page, posts: posts.docs})
          });
      },
      '/a/facebook/posts': (req, res, next) => {
        var page = utils.validator.minOne(req.query.page);
        news.iseeci_posts(page)
          .then(posts => {
            res.render('partials/facebook_posts', {page: page, posts: posts.docs})
          });
      },
      '/lang/:l': (req, res, next) => {
        res.cookie('iseeci-language', req.params.l);
        i18n.setLocale(req.params.l);
        if (req.headers.referer) res.redirect(req.headers.referer);
        else res.redirect("/");
      },
      //Authenticated
      '/profile': [utils.isAuthenticated, (req, res, next) => {
        var menu = utils.element.getMenu().then( value => {
          res.render('profile', {
            menu: value,
            user: req.user
          });
        })
        .catch(error => { logger.error('Error retrieving menu',error); reject(error); });
      }],
      /**/
      '/corregir/elementos': (req,res,next)=>{
        db.elementModel.find({})
          .then(elements => {
            elements.forEach((element)=>{
              console.log(element._id+':'+element.metatags);
              try{
                var parsed = JSON.parse(element.metatags);
                db.elementModel.update({_id:element._id},{$set:{metatags: parsed}},function (err, raw) {
                    if (err) {
                        console.log('Error log: ' + err)
                    } else {
                        console.log("Token updated: " + raw);
                    }
                });
              }
              catch(error) {
                console.log(error);
              }
            })
          })
          .catch(error => { logger.error('Error corrigiendo metatags',error); reject(error); });;
      }
    },
    'post': {
      '/site/contactus': (req, res, next) => {
        utils.contact.create(req.body);
        // setup email data with unicode symbols
        let mailOptions = {
            from: '"iSeeCI" <andres.fernandez@iseeci.com>', // sender address
            to: req.body.email, // list of receivers
            subject: req.body.subject, // Subject line
            text: req.body.message, // plain text body
        };

        // send mail with defined transport object
        mailer.transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return console.log(error);
            }
            logger.log('info','Message %s sent: %s', info.messageId, info.response);
        });
        res.render('contactus', {
          post: true,
          menu: res.menu,
          parent: res.parent,
          user: req.user ? req.user : {fullName: 'guest', profilePic: '/img/site/guest.png'}
        });
      }
    },
    'NA': (req, res, next) => {
      res.status(404).sendFile(process.cwd() + '/views/404.html')
    }
  }

  return utils.route(routes);
}
