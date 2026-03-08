const config = require('../config/env');
const { processInboundWebhook } = require('../services/messageService');

function extractWebhookSecret(req) {
  return (
    req.headers['x-evolution-webhook-secret'] ||
    req.headers['x-webhook-secret'] ||
    req.headers['x-api-secret'] ||
    req.query?.secret ||
    req.body?.secret
  );
}

function ensureWebhookAuthorized(req, res) {
  if (!config.evolution.webhookSecret) {
    return true;
  }

  const receivedSecret = extractWebhookSecret(req);
  if (receivedSecret !== config.evolution.webhookSecret) {
    res.status(401).json({
      error: 'Invalid Evolution webhook secret'
    });
    return false;
  }

  return true;
}

async function ingestWebhook(req, res, next) {
  try {
    if (!ensureWebhookAuthorized(req, res)) {
      return;
    }

    const eventPayload = {
      ...req.body,
      event: req.params.eventName || req.body?.event
    };

    const result = await processInboundWebhook(eventPayload);
    res.json({ ok: true, result });
  } catch (error) {
    next(error);
  }
}

module.exports = { ingestWebhook };
