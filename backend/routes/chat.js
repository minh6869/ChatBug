const express = require('express');
const Joi = require('joi');
const Room = require('../models/Room');
const Message = require('../models/Message');
const auth = require('../middleware/auth');

const router = express.Router();

// Validation schemas
const createRoomSchema = Joi.object({
  name: Joi.string().min(1).max(100).required(),
  description: Joi.string().max(500).allow(''),
  type: Joi.string().valid('public', 'private').default('public')
});

const sendMessageSchema = Joi.object({
  content: Joi.string().min(1).max(1000).required(),
  messageType: Joi.string().valid('text', 'image', 'file').default('text'),
  fileUrl: Joi.string().uri().allow('')
});

// Get all public rooms
router.get('/rooms', auth, async (req, res) => {
  try {
    const rooms = await Room.find({ 
      $or: [
        { type: 'public' },
        { 'members.user': req.userId }
      ]
    })
    .populate('creator', 'username avatar')
    .populate('members.user', 'username avatar isOnline')
    .sort({ lastActivity: -1 });

    res.json({ rooms });
  } catch (error) {
    console.error('Get rooms error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new room
router.post('/rooms', auth, async (req, res) => {
  try {
    const { error } = createRoomSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { name, description, type } = req.body;

    const room = new Room({
      name,
      description,
      type,
      creator: req.userId,
      members: [{
        user: req.userId,
        role: 'admin'
      }]
    });

    await room.save();
    await room.populate('creator', 'username avatar');
    await room.populate('members.user', 'username avatar isOnline');

    res.status(201).json({
      message: 'Room created successfully',
      room
    });
  } catch (error) {
    console.error('Create room error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Join a room
router.post('/rooms/:roomId/join', auth, async (req, res) => {
  try {
    const room = await Room.findById(req.params.roomId);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // Check if user is already a member
    const isMember = room.members.some(member => 
      member.user.toString() === req.userId.toString()
    );

    if (isMember) {
      return res.status(400).json({ message: 'Already a member of this room' });
    }

    // Add user to room
    room.members.push({
      user: req.userId,
      role: 'member'
    });

    await room.save();
    await room.populate('members.user', 'username avatar isOnline');

    res.json({
      message: 'Joined room successfully',
      room
    });
  } catch (error) {
    console.error('Join room error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get messages from a room
router.get('/rooms/:roomId/messages', auth, async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const room = await Room.findById(req.params.roomId);
    
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // Check if user is a member
    const isMember = room.members.some(member => 
      member.user.toString() === req.userId.toString()
    );

    if (!isMember && room.type !== 'public') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const messages = await Message.find({ room: req.params.roomId })
      .populate('sender', 'username avatar')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    res.json({ 
      messages: messages.reverse(),
      hasMore: messages.length === limit
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Send a message
router.post('/rooms/:roomId/messages', auth, async (req, res) => {
  try {
    const { error } = sendMessageSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const room = await Room.findById(req.params.roomId);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // Check if user is a member
    const isMember = room.members.some(member => 
      member.user.toString() === req.userId.toString()
    );

    if (!isMember && room.type !== 'public') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { content, messageType, fileUrl } = req.body;

    const message = new Message({
      content,
      sender: req.userId,
      room: req.params.roomId,
      messageType,
      fileUrl
    });

    await message.save();
    await message.populate('sender', 'username avatar');

    // Update room's last activity
    room.lastActivity = new Date();
    await room.save();

    res.status(201).json({
      message: 'Message sent successfully',
      data: message
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
