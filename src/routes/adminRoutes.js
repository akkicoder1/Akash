const express = require('express');
const {
  getNotifications,
  updateNotification,
  streamNotifications
} = require('../controllers/adminController');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

router.use(requireAuth, requireRole('admin', 'agent'));
router.get('/notifications', getNotifications);
router.patch('/notifications/:id/read', updateNotification);
router.get('/notifications/stream', streamNotifications);

module.exports = router;
