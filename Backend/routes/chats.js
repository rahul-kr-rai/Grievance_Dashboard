const express = require('express');
const Chat = require('../models/Chat');
const router = express.Router();

// Get or create chat channel
async function getChatChannel(channel, citizenName) {
  let chat = await Chat.findOne({ channel, citizenName });
  if (!chat) {
    chat = await Chat.create({ channel, citizenName, messages: [] });
  }
  return chat;
}

// Get chat participants
router.get('/participants/:channel', async (req, res) => {
  try {
    const { channel } = req.params;
    const chats = await Chat.find({ channel }, 'citizenName');
    const participants = chats.map(c => c.citizenName);
    res.json({ success: true, participants });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Send message
router.post('/send', async (req, res) => {
  try {
    const { channel, citizenName, senderLabel, text } = req.body;

    let chat = await Chat.findOne({ channel, citizenName });
    if (!chat) {
      chat = await Chat.create({ channel, citizenName, messages: [] });
    }

    const msg = {
      sender: senderLabel,
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: false
    };

    chat.messages.push(msg);
    await chat.save();

    res.json({ success: true, message: msg });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Mark messages as read
router.post('/mark-read', async (req, res) => {
  try {
    const { channel, citizenName, readerLabel } = req.body;

    let chat = await Chat.findOne({ channel, citizenName });
    if (!chat) {
      return res.json({ success: true, updated: false });
    }

    let updated = false;
    chat.messages.forEach(m => {
      if (m.sender !== readerLabel && !m.read) {
        m.read = true;
        updated = true;
      }
    });

    if (updated) {
      await chat.save();
    }

    res.json({ success: true, updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get total unread count across ALL citizens in a channel
router.get('/unread-total/:channel/:recipientLabel', async (req, res) => {
  try {
    const { channel, recipientLabel } = req.params;
    const chats = await Chat.find({ channel });
    let total = 0;
    chats.forEach(chat => {
      total += chat.messages.filter(m => m.sender !== recipientLabel && !m.read).length;
    });
    res.json({ success: true, total });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get unread count
router.get('/unread/:channel/:citizenName/:recipientLabel', async (req, res) => {
  try {
    const { channel, citizenName, recipientLabel } = req.params;
    let chat = await Chat.findOne({ channel, citizenName });
    if (!chat) {
      return res.json({ success: true, count: 0 });
    }

    const count = chat.messages.filter(m => m.sender !== recipientLabel && !m.read).length;
    res.json({ success: true, count });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get all messages for a citizen in a channel
router.get('/:channel/:citizenName', async (req, res) => {
  try {
    const { channel, citizenName } = req.params;
    const chat = await Chat.findOne({ channel, citizenName });
    const messages = chat ? chat.messages : [];
    res.json({ success: true, messages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete conversation
router.delete('/:channel/:citizenName', async (req, res) => {
  try {
    const { channel, citizenName } = req.params;
    await Chat.deleteOne({ channel, citizenName });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
