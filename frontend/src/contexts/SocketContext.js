import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState({});
  const { user, token } = useAuth();

  useEffect(() => {
    if (user && token) {
      const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';
      
      const newSocket = io(SOCKET_URL, {
        auth: {
          token: token
        },
        transports: ['websocket', 'polling']
      });

      newSocket.on('connect', () => {
        console.log('✅ Connected to socket server');
        setSocket(newSocket);
      });

      newSocket.on('connect_error', (error) => {
        console.error('❌ Socket connection error:', error);
        toast.error('Connection failed. Please refresh the page.');
      });

      newSocket.on('disconnect', (reason) => {
        console.log('❌ Disconnected from socket server:', reason);
        setSocket(null);
      });

      // Handle typing events
      newSocket.on('user-typing', (data) => {
        setTypingUsers(prev => ({
          ...prev,
          [data.roomId]: {
            ...prev[data.roomId],
            [data.userId]: {
              username: data.username,
              timestamp: Date.now()
            }
          }
        }));
      });

      newSocket.on('user-stop-typing', (data) => {
        setTypingUsers(prev => {
          const roomTyping = { ...prev[data.roomId] };
          delete roomTyping[data.userId];
          return {
            ...prev,
            [data.roomId]: roomTyping
          };
        });
      });

      // Handle user status events
      newSocket.on('user-online', (data) => {
        setOnlineUsers(prev => [...prev.filter(id => id !== data.userId), data.userId]);
      });

      newSocket.on('user-offline', (data) => {
        setOnlineUsers(prev => prev.filter(id => id !== data.userId));
      });

      // Handle errors
      newSocket.on('error', (error) => {
        console.error('Socket error:', error);
        toast.error(error.message || 'Something went wrong');
      });

      return () => {
        newSocket.close();
      };
    }
  }, [user, token]);

  // Clean up typing indicators periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setTypingUsers(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(roomId => {
          Object.keys(updated[roomId]).forEach(userId => {
            if (now - updated[roomId][userId].timestamp > 3000) {
              delete updated[roomId][userId];
            }
          });
          if (Object.keys(updated[roomId]).length === 0) {
            delete updated[roomId];
          }
        });
        return updated;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const joinRoom = (roomId) => {
    if (socket) {
      socket.emit('join-room', roomId);
    }
  };

  const leaveRoom = (roomId) => {
    if (socket) {
      socket.emit('leave-room', roomId);
    }
  };

  const sendMessage = (roomId, content, messageType = 'text', fileUrl = '') => {
    if (socket) {
      socket.emit('send-message', {
        roomId,
        content,
        messageType,
        fileUrl
      });
    }
  };

  const startTyping = (roomId) => {
    if (socket) {
      socket.emit('typing', { roomId });
    }
  };

  const stopTyping = (roomId) => {
    if (socket) {
      socket.emit('stop-typing', { roomId });
    }
  };

  const getTypingUsers = (roomId) => {
    return Object.values(typingUsers[roomId] || {});
  };

  const value = {
    socket,
    onlineUsers,
    joinRoom,
    leaveRoom,
    sendMessage,
    startTyping,
    stopTyping,
    getTypingUsers,
    isConnected: !!socket
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
