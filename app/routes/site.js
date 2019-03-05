'use strict';

const utils = require('../utils'),
 fs = require('fs'),
 logger = require('../logger'),
 news = require('../news'),
 krypto = require('../krypto');

 let viewOrElement = (req, res, next) => {
   var view = req.params.view;
       var pars = {
         menu: res.menu,
         parent: res.parent,
         user: req.user ? req.user : {fullName: 'guest', profilePic: '/img/site/guest.png'}
       };
       fs.exists('views/'+view+'.ejs', exists => {
         if(!exists){
           view = 'site';
           res.render(view, pars);
         } else {
           //###NEWS###
           if(view === 'news'){
             pars.page = utils.validator.minOne(req.query.page);
             utils.fbpost.findPaginated(pars.page, news.fbpostPage)
               .then((result) => {
               pars.posts = result.docs;
               res.render(view, pars);
             })
               .catch(error=>{
                 logger.log('error',error);
               });
           }
           //###krypto###
           else if(view == 'krypto'){
             res.render(view, pars);
           }
           //###cex###
           else if(view == 'cex'){
             krypto.cex.getTrades()
             .catch(e => logger.error(e));
             res.send('done cex');
           }
           else {
             res.render(view, pars);
           }
         }
       });
 };
module.exports = {
  viewOrElement
}
