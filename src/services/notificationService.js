const axios = require('axios');
const Notification = require('../models/Notification');
const config = require('../config/env');
const notificationBus = require('../events/notificationBus');

async function createNotification(payload) {
  const notification = await Notification.create(payload);
  notificationBus.emit('notification', notification.toObject());

  if (config.admin.alertWebhook) {
    try {
      await axios.post(config.admin.alertWebhook, {
        text: `[${notification.type}] ${notification.title}\n${notification.message}`
      });
    } catch (error) {
      console.error('[notification] webhook push failed:', error.message);
    }
  }

  return notification;
}

async function listNotifications() {
  return Notification.find().sort({ createdAt: -1 }).limit(200).lean();
}

async function markRead(id) {
  return Notification.findByIdAndUpdate(id, { status: 'read' }, { new: true });
}

module.exports = {
  createNotification,
  listNotifications,
  markRead
};
