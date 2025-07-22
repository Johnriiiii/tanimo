
const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const router = express.Router();
const ChatHistory = require('../models/ChatHistory');
const Conversation = require('../models/Conversation');
const authenticate = require('../middleware/auth');

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const MAX_HISTORY = 10;

// Create or continue conversation
router.post('/chat', authenticate, async (req, res) => {
  try {
    const { message, conversationId } = req.body;
    const userId = req.user._id;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Invalid message format' });
    }

    // Handle conversation
    let conversation;
    if (conversationId) {
      conversation = await Conversation.findOne({ _id: conversationId, user: userId });
      if (!conversation) {
        return res.status(404).json({ error: 'Conversation not found' });
      }
    } else {
      conversation = new Conversation({
        user: userId,
        title: message.substring(0, 30) || 'New Chat'
      });
      await conversation.save();
    }

    // Get conversation history
    const history = await ChatHistory.find({ conversation: conversation._id })
      .sort({ createdAt: -1 })
      .limit(MAX_HISTORY)
      .lean();

    // Initialize model with history
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const chat = model.startChat({
      history: history.reverse().map(msg => ({
        role: msg.role,
        parts: [{ text: msg.content }]
      })),
      generationConfig: { maxOutputTokens: 1000 }
    });

    // Get AI response
    const result = await chat.sendMessage(message);
    const text = (await result.response).text();

    // Save messages
    const [userMsg, aiMsg] = await Promise.all([
      ChatHistory.create({
        user: userId,
        conversation: conversation._id,
        content: message,
        role: 'user'
      }),
      ChatHistory.create({
        user: userId,
        conversation: conversation._id,
        content: text,
        role: 'model'
      })
    ]);

    // Update conversation timestamp
    conversation.updatedAt = new Date();
    await conversation.save();

    res.json({
      response: text,
      conversationId: conversation._id,
      history: [
        ...history.map(h => ({ content: h.content, role: h.role })),
        { content: message, role: 'user' },
        { content: text, role: 'model' }
      ].slice(-MAX_HISTORY * 2)
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      error: error.message || 'Error processing message',
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
  }
});

// Get conversation history
router.get('/conversations/:id/history', authenticate, async (req, res) => {
  try {
    const conversation = await Conversation.findOne({
      _id: req.params.id,
      user: req.user._id
    });
    if (!conversation) return res.status(404).json({ error: 'Conversation not found' });

    const history = await ChatHistory.find({ conversation: conversation._id })
      .sort({ createdAt: 1 })
      .lean();

    res.json(history);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching history' });
  }
});

// Get all conversations
router.get('/conversations', authenticate, async (req, res) => {
  try {
    const conversations = await Conversation.find({ user: req.user._id })
      .sort({ updatedAt: -1 });
    res.json(conversations);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching conversations' });
  }
});

// Create new conversation
router.post('/conversations', authenticate, async (req, res) => {
  try {
    const conversation = new Conversation({
      user: req.user._id,
      title: req.body.title || 'New Chat'
    });
    await conversation.save();
    res.status(201).json(conversation);
  } catch (error) {
    res.status(500).json({ error: 'Error creating conversation' });
  }
});

// Delete conversation
router.delete('/conversations/:id', authenticate, async (req, res) => {
  try {
    await Promise.all([
      Conversation.deleteOne({ _id: req.params.id, user: req.user._id }),
      ChatHistory.deleteMany({ conversation: req.params.id })
    ]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting conversation' });
  }
});


// Update conversation title
router.put('/conversations/:id', authenticate, async (req, res) => {
  try {
    const { title } = req.body;
    
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return res.status(400).json({ error: 'Title is required' });
    }

    // Limit title length
    const trimmedTitle = title.trim().substring(0, 100);

    const conversation = await Conversation.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { title: trimmedTitle, updatedAt: new Date() },
      { new: true }
    );

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    res.json(conversation);
  } catch (error) {
    console.error('Error updating conversation:', error);
    res.status(500).json({ error: 'Error updating conversation' });
  }
});

module.exports = router;
