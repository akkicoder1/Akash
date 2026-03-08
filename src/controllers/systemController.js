const config = require('../config/env');

function getLinkConfig(req, res) {
  return res.json({
    ok: true,
    data: {
      backendPublicUrl: config.urls.backendPublicUrl,
      frontendUrl: config.urls.frontendUrl,
      adminDashboardUrl: config.urls.adminDashboardUrl,
      evolutionWebhookUrl: config.evolution.webhookUrl
    }
  });
}

module.exports = {
  getLinkConfig
};
