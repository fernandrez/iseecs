'use strict';

const db = require('../db');

var dbModel = db.tradecexModel;

module.exports = {
  findOne: x => {
    return dbModel.findOne({
      'tid': x
    })
  },
  create: p => {
    return new Promise((resolve, reject) => {
      let n = new dbModel({
        pair: p.pair,
        type: p.type,
        date: p.date,
        amount: p.amount,
        price: p.price,
        tid: p.tid
      });
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
