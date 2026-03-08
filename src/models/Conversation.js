const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema(
  {
    contact: { type: String, required: true, index: true },
    status: {
      type: String,
      enum: ['bot', 'human_handoff', 'closed'],
      default: 'bot'
    },
    metadata: {
      name: String,
      channel: { type: String, default: 'whatsapp' }
    },
    lastMessageAt: Date
  },
  { timestamps: true }
);

module.exports = mongoose.model('Conversation', conversationSchema);
