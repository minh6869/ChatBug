const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Message = require('../models/Message');
const Room = require('../models/Room');

const socketHandlers = (io) => {
  // Socket authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);
      
      if (!user) {
        return next(new Error('User not found'));
      }

      socket.userId = user._id.toString();
      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', async (socket) => {
    console.log(`✅ User ${socket.user.username} connected`);

    // Update user online status
    await User.findByIdAndUpdate(socket.userId, { 
      isOnline: true 
    });

    // Join user to their rooms
    try {
      const userRooms = await Room.find({ 
        'members.user': socket.userId 
      }).select('_id');
      
      userRooms.forEach(room => {
        socket.join(room._id.toString());
      });
    } catch (error) {
      console.error('Error joining rooms:', error);
    }

    // Handle joining a room
    socket.on('join-room', async (roomId) => {
      try {
        const room = await Room.findById(roomId);
        if (!room) {
          socket.emit('error', { message: 'Room not found' });
          return;
        }

        // Check if user is a member or room is public
        const isMember = room.members.some(member => 
          member.user.toString() === socket.userId
        );

        if (!isMember && room.type !== 'public') {
          socket.emit('error', { message: 'Access denied' });
          return;
        }

        socket.join(roomId);
        socket.emit('joined-room', { roomId, roomName: room.name });
        
        // Notify others in the room
        socket.to(roomId).emit('user-joined', {
          userId: socket.userId,
          username: socket.user.username,
          avatar: socket.user.avatar
        });
      } catch (error) {
        console.error('Join room error:', error);
        socket.emit('error', { message: 'Failed to join room' });
      }
    });

    // Handle leaving a room
    socket.on('leave-room', (roomId) => {
      socket.leave(roomId);
      socket.to(roomId).emit('user-left', {
        userId: socket.userId,
        username: socket.user.username
      });
    });

    // Handle sending messages
    socket.on('send-message', async (data) => {
      try {
        const { roomId, content, messageType = 'text', fileUrl = '' } = data;

        // Validate room access
        const room = await Room.findById(roomId);
        if (!room) {
          socket.emit('error', { message: 'Room not found' });
          return;
        }

        const isMember = room.members.some(member => 
          member.user.toString() === socket.userId
        );

        if (!isMember && room.type !== 'public') {
          socket.emit('error', { message: 'Access denied' });
          return;
        }

        // Create and save message
        const message = new Message({
          content,
          sender: socket.userId,
          room: roomId,
          messageType,
          fileUrl
        });

        await message.save();
        await message.populate('sender', 'username avatar');

        // Update room's last activity
        room.lastActivity = new Date();
        await room.save();

        // Emit message to all users in the room
        io.to(roomId).emit('new-message', {
          _id: message._id,
          content: message.content,
          sender: message.sender,
          room: message.room,
          messageType: message.messageType,
          fileUrl: message.fileUrl,
          createdAt: message.createdAt,
          updatedAt: message.updatedAt
        });

      } catch (error) {
        console.error('Send message error:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle typing indicators
    socket.on('typing', (data) => {
      socket.to(data.roomId).emit('user-typing', {
        userId: socket.userId,
        username: socket.user.username,
        roomId: data.roomId
      });
    });

    socket.on('stop-typing', (data) => {
      socket.to(data.roomId).emit('user-stop-typing', {
        userId: socket.userId,
        username: socket.user.username,
        roomId: data.roomId
      });
    });

    // Handle disconnect
    socket.on('disconnect', async () => {
      console.log(`❌ User ${socket.user.username} disconnected`);
      
      // Update user offline status
      await User.findByIdAndUpdate(socket.userId, { 
        isOnline: false,
        lastSeen: new Date()
      });

      // Notify all rooms about user going offline
      socket.broadcast.emit('user-offline', {
        userId: socket.userId,
        username: socket.user.username
      });
    });

    // Handle errors
    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  });
};

module.exports = socketHandlers;
