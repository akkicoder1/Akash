const mongoose = require('mongoose');

const broadcastCampaignSchema = new mongoose.Schema(
  {
    createdByUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    title: { type: String, required: true },
    message: { type: String, required: true },
    productLinks: [{ type: String }],
    status: {
      type: String,
      enum: ['draft', 'running', 'completed', 'completed_with_errors'],
      default: 'draft'
    },
    recipientCount: { type: Number, default: 0 },
    sentCount: { type: Number, default: 0 },
    failedCount: { type: Number, default: 0 },
    failures: [
      {
        to: String,
        reason: String
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model('BroadcastCampaign', broadcastCampaignSchema);
