const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true,
      index: true
    },
    direction: { type: String, enum: ['inbound', 'outbound'], required: true },
    role: { type: String, enum: ['user', 'assistant', 'system', 'admin'], required: true },
    content: { type: String, required: true },
    providerMessageId: String,
    rawPayload: mongoose.Schema.Types.Mixed
  },
  { timestamps: true }
);

module.exports = mongoose.model('Message', messageSchema);
