const config = require('../config/env');
const { generateReply } = require('../libs/openRouterClient');

function detectHandoffIntent(text) {
  const normalized = (text || '').toLowerCase();
  return config.assistant.handoffKeywords.some((keyword) => normalized.includes(keyword));
}

function systemPrompt() {
  return {
    role: 'system',
    content:
      'You are a concise WhatsApp support assistant. Use friendly tone. If the user asks for unavailable info, say a human will follow up.'
  };
}

async function buildAutoReply(userText, contextMessages = []) {
  if (/^\s*(hi|hey|hello)\s*$/i.test(userText)) {
    return config.assistant.greeting;
  }

  const messages = [systemPrompt(), ...contextMessages, { role: 'user', content: userText }];
  return generateReply(messages);
}

module.exports = {
  detectHandoffIntent,
  buildAutoReply
};
