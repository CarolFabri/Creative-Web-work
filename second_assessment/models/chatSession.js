const mongoose = require('mongoose');

// Each individual message in the chat
const messageSchema = new mongoose.Schema({
  sender: {
    type: String,
    enum: ['user', 'fortuneTeller'],
    required: true
  },
  text: {
    type: String,
    required: true
  },
  time: {
    type: Date,
    default: Date.now
  }
});

// The whole chat session for one user
const chatSessionSchema = new mongoose.Schema({
  // who this history belongs to
  username: {
    type: String,
    required: true
  },

  // OPTIONAL flag – not required anymore, default is true
  createAI: {
    type: Boolean,
    default: true // no "required: true" so validation won't fail
  },

  createdAt: {
    type: Date,
    default: Date.now
  },

  // list of messages in this chat
  messages: [messageSchema]
});

// model name in Mongo: "chatSession"
module.exports = mongoose.model('chatSession', chatSessionSchema);


