const notificationBus = require('../events/notificationBus');
const { listNotifications, markRead } = require('../services/notificationService');

async function getNotifications(req, res, next) {
  try {
    const data = await listNotifications();
    res.json({ ok: true, data });
  } catch (error) {
    next(error);
  }
}

async function updateNotification(req, res, next) {
  try {
    const notification = await markRead(req.params.id);
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    return res.json({ ok: true, data: notification });
  } catch (error) {
    return next(error);
  }
}

function streamNotifications(req, res) {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const listener = (notification) => {
    res.write(`event: admin-notification\n`);
    res.write(`data: ${JSON.stringify(notification)}\n\n`);
  };

  notificationBus.on('notification', listener);

  req.on('close', () => {
    notificationBus.off('notification', listener);
  });
}

module.exports = {
  getNotifications,
  updateNotification,
  streamNotifications
};
