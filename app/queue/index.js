'use strict';
var events = require('events');
var eventEmitter = new events.EventEmitter();

var maxConcurrent = 1;
var maxQueue = Infinity;
//Llamada al modelo de mongoose para encontrar las plataformas que hay
var platforms = db.platforms.find({});
//Esta variable es la que se debe usar para enviar las calls a apiDispatcher al queue
//Y así garantizar una llamada a la api por vez
var queue = [];
for (var p in platforms){
  var queue[p.name] = new Queue(maxConcurrent, maxQueue);
  //observar un evento
  event.on('platform-added',(name) => {
    queue[name] = new Queue(maxConcurrent, maxQueue);
  });
}

module.exports({
  queue
});
