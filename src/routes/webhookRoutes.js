const express = require('express');
const { ingestWebhook } = require('../controllers/webhookController');

const router = express.Router();

router.post('/evolution', ingestWebhook);
router.post('/evolution/:eventName', ingestWebhook);

module.exports = router;
