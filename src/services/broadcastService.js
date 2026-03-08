const BroadcastCampaign = require('../models/BroadcastCampaign');
const Conversation = require('../models/Conversation');
const { sendTextMessage } = require('../libs/evolutionClient');
const { getOrCreateConversation, addMessage } = require('./conversationService');
const { createNotification } = require('./notificationService');
const config = require('../config/env');

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function uniqueRecipients(items = []) {
  return [...new Set(items.map((value) => (value || '').trim()).filter(Boolean))];
}

function buildOfferMessage({ title, offerText, productLinks = [] }) {
  const links = productLinks.filter(Boolean);
  const linksBlock = links.length ? `\n\nProduct links:\n${links.map((l) => `- ${l}`).join('\n')}` : '';
  return `*${title}*\n${offerText}${linksBlock}`;
}

async function resolveRecipients(explicitRecipients = []) {
  if (explicitRecipients.length) {
    return uniqueRecipients(explicitRecipients);
  }

  const existingContacts = await Conversation.distinct('contact');
  return uniqueRecipients(existingContacts);
}

async function previewBroadcast({ title, offerText, productLinks, recipients }) {
  const resolvedRecipients = await resolveRecipients(recipients || []);
  const limitedRecipients = resolvedRecipients.slice(0, config.automation.maxRecipientsPerRun);

  const message = buildOfferMessage({
    title,
    offerText: offerText || config.automation.defaultOfferText,
    productLinks: productLinks?.length ? productLinks : config.automation.defaultProductLinks
  });

  return {
    recipientCount: limitedRecipients.length,
    recipientsSample: limitedRecipients.slice(0, 10),
    message
  };
}

async function runBroadcast({ title, offerText, productLinks, recipients, createdByUserId }) {
  const resolvedRecipients = await resolveRecipients(recipients || []);
  const limitedRecipients = resolvedRecipients.slice(0, config.automation.maxRecipientsPerRun);
  const message = buildOfferMessage({
    title,
    offerText: offerText || config.automation.defaultOfferText,
    productLinks: productLinks?.length ? productLinks : config.automation.defaultProductLinks
  });

  const campaign = await BroadcastCampaign.create({
    createdByUserId,
    title,
    message,
    productLinks: productLinks?.length ? productLinks : config.automation.defaultProductLinks,
    status: 'running',
    recipientCount: limitedRecipients.length
  });

  let sentCount = 0;
  const failures = [];

  for (const to of limitedRecipients) {
    try {
      const providerResponse = await sendTextMessage({ to, text: message });
      const conversation = await getOrCreateConversation(to);
      await addMessage({
        conversationId: conversation._id,
        direction: 'outbound',
        role: 'admin',
        content: message,
        providerMessageId: providerResponse?.key?.id,
        rawPayload: { campaignId: campaign._id }
      });
      sentCount += 1;
    } catch (error) {
      failures.push({ to, reason: error.message });
    }

    if (config.automation.broadcastDelayMs > 0) {
      await sleep(config.automation.broadcastDelayMs);
    }
  }

  campaign.sentCount = sentCount;
  campaign.failedCount = failures.length;
  campaign.failures = failures;
  campaign.status = failures.length ? 'completed_with_errors' : 'completed';
  await campaign.save();

  await createNotification({
    type: failures.length ? 'critical_error' : 'new_lead',
    title: `Broadcast ${campaign.status}`,
    message: `Campaign \"${campaign.title}\" sent ${sentCount}/${limitedRecipients.length} messages.`,
    meta: {
      campaignId: campaign._id,
      failedCount: failures.length
    }
  });

  return campaign;
}

module.exports = {
  previewBroadcast,
  runBroadcast
};
