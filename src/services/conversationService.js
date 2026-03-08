const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const config = require('../config/env');

async function getOrCreateConversation(contact, metadata = {}) {
  const conversation = await Conversation.findOneAndUpdate(
    { contact },
    {
      $setOnInsert: {
        contact,
        metadata,
        status: 'bot'
      },
      $set: { lastMessageAt: new Date() }
    },
    { upsert: true, new: true }
  );

  return conversation;
}

async function addMessage({ conversationId, direction, role, content, rawPayload, providerMessageId }) {
  return Message.create({
    conversationId,
    direction,
    role,
    content,
    rawPayload,
    providerMessageId
  });
}

async function getContextMessages(conversationId) {
  const rows = await Message.find({ conversationId })
    .sort({ createdAt: -1 })
    .limit(config.assistant.contextMaxMessages)
    .lean();

  return rows.reverse().map((m) => ({
    role: m.role === 'assistant' ? 'assistant' : 'user',
    content: m.content
  }));
}

async function setHandoff(conversationId) {
  return Conversation.findByIdAndUpdate(conversationId, { status: 'human_handoff' }, { new: true });
}

module.exports = {
  getOrCreateConversation,
  addMessage,
  getContextMessages,
  setHandoff
};
