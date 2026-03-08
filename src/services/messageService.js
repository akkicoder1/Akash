const { sendTextMessage } = require('../libs/evolutionClient');
const {
  getOrCreateConversation,
  addMessage,
  getContextMessages,
  setHandoff
} = require('./conversationService');
const { detectHandoffIntent, buildAutoReply } = require('./aiService');
const { createNotification } = require('./notificationService');

function extractInbound(eventPayload = {}) {
  const message = eventPayload?.data?.message || eventPayload?.message || {};

  return {
    from: eventPayload?.data?.key?.remoteJid || message?.from || eventPayload?.from,
    text:
      message?.conversation ||
      message?.extendedTextMessage?.text ||
      eventPayload?.text ||
      ''
  };
}

async function processInboundWebhook(eventPayload) {
  const inbound = extractInbound(eventPayload);
  if (!inbound.from || !inbound.text) {
    return { skipped: true, reason: 'No text message' };
  }

  const conversation = await getOrCreateConversation(inbound.from);

  await addMessage({
    conversationId: conversation._id,
    direction: 'inbound',
    role: 'user',
    content: inbound.text,
    rawPayload: eventPayload
  });

  if (detectHandoffIntent(inbound.text)) {
    await setHandoff(conversation._id);

    await createNotification({
      type: 'handoff_requested',
      title: 'Human handoff requested',
      message: `User ${inbound.from} asked for a human agent.`,
      conversationId: conversation._id,
      meta: { inboundText: inbound.text }
    });

    const handoffReply = 'Got it — I am notifying a human agent now. They will respond shortly.';
    await sendTextMessage({ to: inbound.from, text: handoffReply });
    await addMessage({
      conversationId: conversation._id,
      direction: 'outbound',
      role: 'assistant',
      content: handoffReply
    });

    return { handoff: true };
  }

  const contextMessages = await getContextMessages(conversation._id);
  const aiReply = await buildAutoReply(inbound.text, contextMessages);

  const providerResponse = await sendTextMessage({ to: inbound.from, text: aiReply });

  await addMessage({
    conversationId: conversation._id,
    direction: 'outbound',
    role: 'assistant',
    content: aiReply,
    providerMessageId: providerResponse?.key?.id
  });

  return { handoff: false, replied: true, aiReply };
}

async function sendManualReply({ to, text, adminName }) {
  const conversation = await getOrCreateConversation(to);
  const providerResponse = await sendTextMessage({ to, text });

  await addMessage({
    conversationId: conversation._id,
    direction: 'outbound',
    role: 'admin',
    content: text,
    providerMessageId: providerResponse?.key?.id,
    rawPayload: { adminName }
  });

  return providerResponse;
}

module.exports = {
  processInboundWebhook,
  sendManualReply
};
