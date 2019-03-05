'use strict';

const db = require('../db');

module.exports = {
  find: email => {
    return db.contactModel.find({
      'email': email
    })
  },
  create: contact => {
    return new Promise((resolve, reject) => {
      let newContact = new db.contactModel({
        name: contact.name,
        email: contact.email,
        mobile: contact.mobile,
        subject: contact.subject,
        message: contact.message
      });
      newContact.save(error => {
        if(error) {
          reject(error);
        } else {
          resolve(newContact);
        }
      });
    });
  },
  findById: id => {
    return new Promise((resolve, reject) => {
      db.contactModel.findById(id, (error, contact) => {
        if(error) {
          reject(error);
        } else {
          resolve(contact);
        }
      });
    });
  }
}
