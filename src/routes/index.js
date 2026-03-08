const express = require('express');
const webhookRoutes = require('./webhookRoutes');
const messageRoutes = require('./messageRoutes');
const adminRoutes = require('./adminRoutes');
const authRoutes = require('./authRoutes');
const automationRoutes = require('./automationRoutes');
const { checkAutomation } = require('../controllers/automationController');
const { getLinkConfig } = require('../controllers/systemController');

const router = express.Router();

router.get('/health', (req, res) => {
  res.json({ ok: true, service: 'akash-backend' });
});

router.get('/automation/check', checkAutomation);
router.get('/system/links', getLinkConfig);
router.use('/auth', authRoutes);
router.use('/webhooks', webhookRoutes);
router.use('/messages', messageRoutes);
router.use('/admin', adminRoutes);
router.use('/automation', automationRoutes);

module.exports = router;
