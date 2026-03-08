const dotenv = require('dotenv');

dotenv.config();

function parseCsv(value) {
  return (value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

const required = [
  'MONGODB_URI',
  'JWT_SECRET',
  'EVOLUTION_BASE_URL',
  'EVOLUTION_API_KEY',
  'EVOLUTION_INSTANCE',
  'EVOLUTION_WEBHOOK_SECRET',
  'OPENROUTER_API_KEY'
];

const missing = required.filter((key) => !process.env[key]);
if (missing.length && process.env.NODE_ENV !== 'test') {
  console.warn(`[config] Missing env vars: ${missing.join(', ')}`);
}

const backendPublicUrl = (process.env.BACKEND_PUBLIC_URL || '').replace(/\/$/, '');

module.exports = {
  env: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 8080),
  mongoUri: process.env.MONGODB_URI,
  urls: {
    backendPublicUrl: backendPublicUrl || `http://localhost:${Number(process.env.PORT || 8080)}`,
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
    adminDashboardUrl: process.env.ADMIN_DASHBOARD_URL || process.env.FRONTEND_URL || 'http://localhost:3000',
    corsOrigins: parseCsv(process.env.CORS_ORIGINS || process.env.FRONTEND_URL || 'http://localhost:3000')
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'unsafe-dev-secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  },
  evolution: {
    baseUrl: process.env.EVOLUTION_BASE_URL,
    apiKey: process.env.EVOLUTION_API_KEY,
    instance: process.env.EVOLUTION_INSTANCE,
    webhookSecret: process.env.EVOLUTION_WEBHOOK_SECRET,
    webhookUrl:
      process.env.EVOLUTION_WEBHOOK_URL ||
      `${backendPublicUrl || `http://localhost:${Number(process.env.PORT || 8080)}`}/api/webhooks/evolution`
  },
  openRouter: {
    baseUrl: process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPENROUTER_API_KEY,
    model: process.env.OPENROUTER_MODEL || 'google/gemini-2.0-flash-exp:free'
  },
  assistant: {
    greeting: process.env.ASSISTANT_GREETING || 'Hey! I am your assistant. How can I help you today?',
    handoffKeywords: (process.env.HUMAN_HANDOFF_KEYWORDS || 'human,agent,representative')
      .split(',')
      .map((v) => v.trim().toLowerCase())
      .filter(Boolean),
    contextMaxMessages: Number(process.env.AI_CONTEXT_MAX_MESSAGES || 12)
  },
  automation: {
    defaultOfferTitle: process.env.BROADCAST_DEFAULT_TITLE || 'Special Offer for You',
    defaultOfferText:
      process.env.BROADCAST_DEFAULT_OFFER_TEXT ||
      'Hi! We have exciting offers and products for you. Reply to this message to get personalized help.',
    defaultProductLinks: parseCsv(process.env.BROADCAST_PRODUCT_LINKS),
    broadcastDelayMs: Number(process.env.BROADCAST_DELAY_MS || 300),
    maxRecipientsPerRun: Number(process.env.BROADCAST_MAX_RECIPIENTS || 500)
  },
  admin: {
    alertEmail: process.env.ADMIN_ALERT_EMAIL,
    alertWebhook: process.env.ADMIN_ALERT_WEBHOOK
  }
};
