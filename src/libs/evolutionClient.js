const { createHttpClient } = require('./httpClient');
const config = require('../config/env');

const client = createHttpClient({
  baseURL: config.evolution.baseUrl,
  headers: {
    apikey: config.evolution.apiKey,
    'Content-Type': 'application/json'
  }
});

async function sendTextMessage({ to, text }) {
  const payload = {
    number: to,
    text,
    delay: 500
  };

  const { data } = await client.post(`/message/sendText/${config.evolution.instance}`, payload);
  return data;
}

module.exports = {
  sendTextMessage
};
