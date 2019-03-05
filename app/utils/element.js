'use strict';

const db = require('../db');

module.exports = {
  findOne: codigo => {
    return db.elementModel.findOne({
      'codigo': codigo
    })
  },
  findChildren: codigo => {
    return db.elementModel.find({
      'parent': codigo
    },[], {
      sort: 'posicion'
    })
  },
  findByTipo: tipo => {
    return db.elementModel.find({
      'tipo_elemento': tipo
    }, [], {
      sort: 'posicion'
    })
  },
  getMenu: () => {
    return new Promise((resolve, reject) => {
      db.elementModel.find({
        'tipo_elemento': 'menu'
      }, [], {
        sort: 'posicion'
      })
        .then(menu => {
          var i; var prs = [];
          for(i = 0; i < menu.length; i++){
            prs[i] = db.elementModel.find({
              parent: menu[i].codigo
            },[], {
              sort: 'posicion'
            });
          }
          Promise.all(prs)
            .then(values => {values.forEach((v,i) => menu[i].children = v); resolve(menu);});
        })
        .catch(error => {
          logger.error('Error finding menu elements', error)
          reject(error);
        });
    })
  },
  create: element => {
    return new Promise((resolve, reject) => {
      let newElement = new db.elementModel({
        parent: element.parent,
        codigo: element.codigo,
        titulo: element.titulo,
        subtitulo: element.subtitulo,
        descripcion: element.descripcion,
        con_link: element.con_link,
        link: element.link,
        metatags: element.metatags
      });
      newElement.save(error => {
        if(error) {
          reject(error);
        } else {
          resolve(newElement);
        }
      });
    });
  },
  findById: id => {
    return new Promise((resolve, reject) => {
      db.elementModel.findById(id, (error, element) => {
        if(error) {
          reject(error);
        } else {
          resolve(element);
        }
      });
    });
  }
}
