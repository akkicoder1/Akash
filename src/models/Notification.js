const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['handoff_requested', 'critical_error', 'new_lead'],
      required: true
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation' },
    status: { type: String, enum: ['unread', 'read'], default: 'unread' },
    meta: mongoose.Schema.Types.Mixed
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);
