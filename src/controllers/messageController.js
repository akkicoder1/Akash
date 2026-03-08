const { sendManualReply } = require('../services/messageService');
const { manualSendSchema } = require('../utils/validators');

async function manualSend(req, res, next) {
  try {
    const { error, value } = manualSendSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.message });
    }

    const response = await sendManualReply(value);
    return res.json({ ok: true, response });
  } catch (err) {
    return next(err);
  }
}

module.exports = { manualSend };
