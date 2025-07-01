const mongoose = require('mongoose');

const chatHistorySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  conversation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true
  },
  content: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['user', 'model'],
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Add indexes for better performance
chatHistorySchema.index({ conversation: 1, createdAt: 1 });

module.exports = mongoose.model('ChatHistory', chatHistorySchema);