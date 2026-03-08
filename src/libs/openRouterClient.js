const { createHttpClient } = require('./httpClient');
const config = require('../config/env');

const client = createHttpClient({
  baseURL: config.openRouter.baseUrl,
  headers: {
    Authorization: `Bearer ${config.openRouter.apiKey}`,
    'Content-Type': 'application/json',
    'HTTP-Referer': config.urls.frontendUrl,
    'X-Title': 'Akash AI Assistant'
  }
});

async function generateReply(messages) {
  const payload = {
    model: config.openRouter.model,
    messages,
    temperature: 0.4
  };

  const { data } = await client.post('/chat/completions', payload);
  return data?.choices?.[0]?.message?.content || 'Sorry, I could not generate a response right now.';
}

module.exports = { generateReply };
