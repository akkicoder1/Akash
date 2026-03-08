const express = require('express');
const { manualSend } = require('../controllers/messageController');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

router.post('/send', requireAuth, requireRole('admin', 'agent'), manualSend);

module.exports = router;
