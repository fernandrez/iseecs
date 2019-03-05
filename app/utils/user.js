'use strict';

const db = require('../db');

module.exports = {
  findOne: profileID => {
    return db.userModel.findOne({
      'profileId': profileID
    })
  },
  create: profile => {
    return new Promise((resolve, reject) => {
      let newUser = new db.userModel({
        profileId: profile.id,
        fullName: profile.displayName,
        profilePic: profile.photos[0].value || ''
      });
      newUser.save(error => {
        if(error) {
          reject(error);
        } else {
          resolve(newUser);
        }
      });
    });
  },
  findById: id => {
    return new Promise((resolve, reject) => {
      db.userModel.findById(id, (error, user) => {
        if(error) {
          reject(error);
        } else {
          resolve(user);
        }
      });
    });
  }
}
