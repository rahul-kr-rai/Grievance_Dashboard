const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: String,
  text: String,
  time: String,
  read: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const chatSchema = new mongoose.Schema({
  channel: {
    type: String,
    enum: ['mukhiya', 'sarpanch', 'other'],
    required: true
  },
  citizenName: {
    type: String,
    required: true
  },
  messages: [messageSchema],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

chatSchema.index({ channel: 1, citizenName: 1 }, { unique: true });

module.exports = mongoose.model('Chat', chatSchema);
