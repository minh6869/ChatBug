import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { FiSend, FiSmile, FiPaperclip, FiMoreVertical } from 'react-icons/fi';
import { useSocket } from '../../contexts/SocketContext';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import MessageList from './MessageList';
import TypingIndicator from './TypingIndicator';

const Container = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100vh;
`;

const Header = styled.div`
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  background: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const RoomInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const RoomAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 1.1rem;
`;

const RoomDetails = styled.div``;

const RoomName = styled.h2`
  font-size: 1.1rem;
  font-weight: 600;
  color: #1a202c;
  margin: 0;
`;

const RoomMeta = styled.div`
  font-size: 0.8rem;
  color: #64748b;
  margin-top: 0.25rem;
`;

const Actions = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  padding: 0.5rem;
  border-radius: 8px;
  cursor: pointer;
  color: #64748b;
  transition: all 0.2s;
  
  &:hover {
    background: #f1f5f9;
    color: #374151;
  }
`;

const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  background: #f8fafc;
`;

const InputContainer = styled.div`
  padding: 1rem 1.5rem;
  background: white;
  border-top: 1px solid #e2e8f0;
`;

const InputWrapper = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 0.75rem;
  background: #f8fafc;
  padding: 0.75rem;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  
  &:focus-within {
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`;

const MessageInput = styled.textarea`
  flex: 1;
  border: none;
  background: none;
  resize: none;
  font-size: 0.95rem;
  line-height: 1.4;
  max-height: 120px;
  min-height: 20px;
  
  &:focus {
    outline: none;
  }
  
  &::placeholder {
    color: #9ca3af;
  }
`;

const InputActions = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
`;

const InputButton = styled.button`
  background: none;
  border: none;
  padding: 0.5rem;
  border-radius: 6px;
  cursor: pointer;
  color: #64748b;
  transition: all 0.2s;
  
  &:hover {
    background: #e2e8f0;
    color: #374151;
  }
`;

const SendButton = styled.button`
  background: ${props => props.disabled ? '#cbd5e1' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'};
  border: none;
  padding: 0.5rem;
  border-radius: 6px;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  color: white;
  transition: all 0.2s;
  
  &:hover {
    transform: ${props => props.disabled ? 'none' : 'translateY(-1px)'};
  }
`;

const EmptyState = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: #64748b;
  
  h3 {
    font-size: 1.2rem;
    margin-bottom: 0.5rem;
    color: #374151;
  }
  
  p {
    font-size: 0.9rem;
    line-height: 1.5;
  }
`;

const ChatArea = ({ activeRoom, onShowProfile }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [typing, setTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const { socket, sendMessage, joinRoom, getTypingUsers, startTyping, stopTyping } = useSocket();
  const { user } = useAuth();

  useEffect(() => {
    if (activeRoom) {
      fetchMessages();
      joinRoom(activeRoom._id);
    }
  }, [activeRoom]);

  useEffect(() => {
    if (socket && activeRoom) {
      const handleNewMessage = (message) => {
        if (message.room === activeRoom._id) {
          setMessages(prev => [...prev, message]);
          scrollToBottom();
        }
      };

      socket.on('new-message', handleNewMessage);

      return () => {
        socket.off('new-message', handleNewMessage);
      };
    }
  }, [socket, activeRoom]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    if (!activeRoom) return;
    
    try {
      setLoading(true);
      const response = await axios.get(`/api/chat/rooms/${activeRoom._id}/messages`);
      setMessages(response.data.messages);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
    
    if (!typing && activeRoom) {
      setTyping(true);
      startTyping(activeRoom._id);
    }
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      setTyping(false);
      if (activeRoom) {
        stopTyping(activeRoom._id);
      }
    }, 1000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSendMessage = () => {
    const trimmedMessage = newMessage.trim();
    if (!trimmedMessage || !activeRoom) return;

    sendMessage(activeRoom._id, trimmedMessage);
    setNewMessage('');
    
    // Stop typing
    if (typing) {
      setTyping(false);
      stopTyping(activeRoom._id);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    }
  };

  if (!activeRoom) {
    return (
      <Container>
        <EmptyState>
          <h3>Welcome to ChatBug!</h3>
          <p>
            Select a room from the sidebar to start chatting,<br />
            or create a new room to begin conversations.
          </p>
        </EmptyState>
      </Container>
    );
  }

  const typingUsers = getTypingUsers(activeRoom._id).filter(u => u.username !== user?.username);

  return (
    <Container>
      <Header>
        <RoomInfo>
          <RoomAvatar>
            {activeRoom.avatar || activeRoom.name[0]?.toUpperCase()}
          </RoomAvatar>
          <RoomDetails>
            <RoomName>{activeRoom.name}</RoomName>
            <RoomMeta>
              {activeRoom.members.length} members • {activeRoom.type} room
            </RoomMeta>
          </RoomDetails>
        </RoomInfo>
        <Actions>
          <ActionButton title="More options">
            <FiMoreVertical size={18} />
          </ActionButton>
        </Actions>
      </Header>

      <MessagesContainer>
        <MessageList messages={messages} loading={loading} />
        {typingUsers.length > 0 && (
          <TypingIndicator users={typingUsers} />
        )}
        <div ref={messagesEndRef} />
      </MessagesContainer>

      <InputContainer>
        <InputWrapper>
          <InputActions>
            <InputButton title="Attach file">
              <FiPaperclip size={18} />
            </InputButton>
            <InputButton title="Emoji">
              <FiSmile size={18} />
            </InputButton>
          </InputActions>
          
          <MessageInput
            value={newMessage}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder={`Message #${activeRoom.name}`}
            rows={1}
          />
          
          <SendButton
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            title="Send message"
          >
            <FiSend size={18} />
          </SendButton>
        </InputWrapper>
      </InputContainer>
    </Container>
  );
};

export default ChatArea;
