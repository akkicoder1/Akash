const { EventEmitter } = require('events');

const notificationBus = new EventEmitter();

module.exports = notificationBus;
