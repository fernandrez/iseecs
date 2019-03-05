'use strict';

const db = require('../db');

var dbModel = db.tradelbtcModel;

module.exports = {
  findOne: x => {
    return dbModel.findOne({
      'contact_id': x
    })
  },
  findOneAndUpdate: x => {
    return new Promise((resolve, reject) => {
      const query = { contact_id: x.contact_id };
      dbModel.findOneAndUpdate(query, x, { upsert: true }, (err, data) => {
        if(err) { log.error("Error finding contact", err); reject(err); }
        else { resolve(data); }
      })
    });
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
