const mongoose = require('mongoose');
const config = require('../config/env');
const { broadcastSchema } = require('../utils/validators');
const { previewBroadcast, runBroadcast } = require('../services/broadcastService');

function checkAutomation(req, res) {
  const requiredEnv = [
    'MONGODB_URI',
    'JWT_SECRET',
    'EVOLUTION_BASE_URL',
    'EVOLUTION_API_KEY',
    'EVOLUTION_INSTANCE',
    'EVOLUTION_WEBHOOK_SECRET',
    'OPENROUTER_API_KEY'
  ];

  const envChecks = requiredEnv.map((key) => ({
    key,
    present: Boolean(process.env[key])
  }));

  const allEnvPresent = envChecks.every((item) => item.present);
  const dbReady = mongoose.connection.readyState === 1;
  const linkingReady = Boolean(config.urls.backendPublicUrl && config.urls.frontendUrl);

  return res.json({
    ok: allEnvPresent && dbReady && linkingReady,
    automation: {
      webhookIngestion: true,
      webhookSecretValidation: Boolean(config.evolution.webhookSecret),
      aiAutoReply: Boolean(config.openRouter.apiKey && config.openRouter.model),
      humanHandoff: true,
      adminNotifications: true,
      manualMessageSend: true,
      auth: true,
      frontendBackendLinking: linkingReady,
      broadcastOffers: true
    },
    checks: {
      databaseConnected: dbReady,
      env: envChecks,
      links: {
        backendPublicUrl: config.urls.backendPublicUrl,
        frontendUrl: config.urls.frontendUrl,
        adminDashboardUrl: config.urls.adminDashboardUrl,
        evolutionWebhookUrl: config.evolution.webhookUrl,
        corsOrigins: config.urls.corsOrigins
      },
      broadcastDefaults: {
        title: config.automation.defaultOfferTitle,
        offerText: config.automation.defaultOfferText,
        productLinks: config.automation.defaultProductLinks,
        maxRecipientsPerRun: config.automation.maxRecipientsPerRun,
        delayMs: config.automation.broadcastDelayMs
      }
    }
  });
}

async function previewMassMessage(req, res, next) {
  try {
    const { error, value } = broadcastSchema.validate(req.body || {});
    if (error) {
      return res.status(400).json({ error: error.message });
    }

    const data = await previewBroadcast({
      title: value.title || config.automation.defaultOfferTitle,
      offerText: value.offerText,
      productLinks: value.productLinks,
      recipients: value.recipients
    });

    return res.json({ ok: true, data });
  } catch (err) {
    return next(err);
  }
}

async function sendMassMessage(req, res, next) {
  try {
    const { error, value } = broadcastSchema.validate(req.body || {});
    if (error) {
      return res.status(400).json({ error: error.message });
    }

    const data = await runBroadcast({
      title: value.title || config.automation.defaultOfferTitle,
      offerText: value.offerText,
      productLinks: value.productLinks,
      recipients: value.recipients,
      createdByUserId: req.auth?.sub
    });

    return res.json({ ok: true, data });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  checkAutomation,
  previewMassMessage,
  sendMassMessage
};
