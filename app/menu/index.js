'use strict';
const utils = require('../utils');
const logger = require('../logger');

logger.info(__dirname.match(/([^\/]*)\/*$/)[1],'module loaded');

module.exports = {
    // primer y segundo nivel del menu directo a res
    menu: (req, res, next) => {
        var menu = utils.element.getMenu()
                    .then(value => {
                      res.menu = value
                      next();
                    })
        						.catch(error => {
                      logger.log('error', 'Error when retrieving menu ' + error);
                      next();
                    });
    },
    // elemento padre e hijos directo a res
    element: (req, res, next) => {
      var eP = utils.element.findOne(req.params.code);
      var eC = utils.element.findChildren(req.params.code);
      Promise.all([eP, eC])
        .then(values => {
          res.parent = values[0]; res.parent.children = values[1];
          var eG = utils.element.findOne(values[0].parent)
            .then(value => {
                res.parent.parent = value;
                next();
              }
            )
            .catch(error => {
              logger.log('error', 'Error when retrieving grand parent: ' + error);
              next();
            });
        })
        .catch(error => {
          logger.log('error', 'Error when retrieving element and children: ' + error);
          next();
        });
    }
}
