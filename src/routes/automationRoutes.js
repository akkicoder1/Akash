const express = require('express');
const { requireAuth, requireRole } = require('../middleware/auth');
const { previewMassMessage, sendMassMessage } = require('../controllers/automationController');

const router = express.Router();

router.use(requireAuth, requireRole('admin'));
router.post('/mass-message/preview', previewMassMessage);
router.post('/mass-message/send', sendMassMessage);

module.exports = router;
