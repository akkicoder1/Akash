const { processInboundWebhook } = require('../services/messageService');

async function ingestWebhook(req, res, next) {
  try {
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
