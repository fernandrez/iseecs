'use strict';

const db = require('../db'),
    logger = require('../logger');

var dbModel = db.orderbookcexModel;

module.exports = {
  findOne: x => {
    return dbModel.findOne({
      'id': x
    })
  },
  create: p => {
    return new Promise((resolve, reject) => {
      let n = new dbModel(p);
      n.save(error => {
        if(error) {
          reject(error);
        } else {
          n.db.close();
          resolve(n);
        }
      });
    });
  },
  rawInsert: p => {
    return dbModel.collection.insert(p);
  },
  findById: id => {
    return new Promise((resolve, reject) => {
      dbModel.findById(id, (error, post) => {
        if(error) {
          reject(error);
        } else {
          resolve(post);
        }
      });
    });
  }
}
