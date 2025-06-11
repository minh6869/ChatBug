import React from 'react';
import styled from 'styled-components';
import { format, isToday, isYesterday, formatDistanceToNow } from 'date-fns';
import { useAuth } from '../../contexts/AuthContext';

const Container = styled.div`
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const MessageGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const MessageContainer = styled.div`
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
  padding: 0.5rem 0;
  
  &:hover {
    background: rgba(0, 0, 0, 0.02);
    border-radius: 8px;
    margin: 0 -0.5rem;
    padding: 0.5rem;
  }
`;

const Avatar = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 0.9rem;
  flex-shrink: 0;
`;

const MessageContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const MessageHeader = styled.div`
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
`;

const Username = styled.span`
  font-weight: 600;
  color: #374151;
  font-size: 0.9rem;
`;

const Timestamp = styled.span`
  font-size: 0.75rem;
  color: #9ca3af;
`;

const MessageText = styled.div`
  color: #374151;
  font-size: 0.9rem;
  line-height: 1.4;
  word-wrap: break-word;
  white-space: pre-wrap;
`;

const DateDivider = styled.div`
  display: flex;
  align-items: center;
  margin: 1rem 0;
  text-align: center;
  
  &::before,
  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: #e2e8f0;
  }
  
  span {
    padding: 0 1rem;
    font-size: 0.8rem;
    color: #64748b;
    font-weight: 500;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  color: #64748b;
`;

const EmptyContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
  color: #64748b;
  
  h3 {
    font-size: 1.1rem;
    margin-bottom: 0.5rem;
    color: #374151;
  }
  
  p {
    font-size: 0.9rem;
  }
`;

const MessageList = ({ messages, loading }) => {
  const { user } = useAuth();

  const formatMessageTime = (date) => {
    const messageDate = new Date(date);
    
    if (isToday(messageDate)) {
      return format(messageDate, 'HH:mm');
    } else if (isYesterday(messageDate)) {
      return 'Yesterday ' + format(messageDate, 'HH:mm');
    } else {
      return format(messageDate, 'MMM d, HH:mm');
    }
  };

  const formatDateDivider = (date) => {
    const messageDate = new Date(date);
    
    if (isToday(messageDate)) {
      return 'Today';
    } else if (isYesterday(messageDate)) {
      return 'Yesterday';
    } else {
      return format(messageDate, 'MMMM d, yyyy');
    }
  };

  const shouldShowDateDivider = (currentMessage, previousMessage) => {
    if (!previousMessage) return true;
    
    const currentDate = new Date(currentMessage.createdAt);
    const previousDate = new Date(previousMessage.createdAt);
    
    return currentDate.toDateString() !== previousDate.toDateString();
  };

  const shouldGroupMessage = (currentMessage, previousMessage) => {
    if (!previousMessage) return false;
    
    const timeDiff = new Date(currentMessage.createdAt) - new Date(previousMessage.createdAt);
    const fiveMinutes = 5 * 60 * 1000;
    
    return (
      currentMessage.sender._id === previousMessage.sender._id &&
      timeDiff < fiveMinutes
    );
  };

  if (loading) {
    return (
      <LoadingContainer>
        Loading messages...
      </LoadingContainer>
    );
  }

  if (messages.length === 0) {
    return (
      <EmptyContainer>
        <h3>No messages yet</h3>
        <p>Be the first to send a message in this room!</p>
      </EmptyContainer>
    );
  }

  return (
    <Container>
      {messages.map((message, index) => {
        const previousMessage = messages[index - 1];
        const showDateDivider = shouldShowDateDivider(message, previousMessage);
        const isGrouped = shouldGroupMessage(message, previousMessage);
        
        return (
          <MessageGroup key={message._id}>
            {showDateDivider && (
              <DateDivider>
                <span>{formatDateDivider(message.createdAt)}</span>
              </DateDivider>
            )}
            
            <MessageContainer>
              {!isGrouped && (
                <Avatar>
                  {message.sender.avatar || message.sender.username[0]?.toUpperCase()}
                </Avatar>
              )}
              
              {isGrouped && <div style={{ width: '36px' }} />}
              
              <MessageContent>
                {!isGrouped && (
                  <MessageHeader>
                    <Username>{message.sender.username}</Username>
                    <Timestamp>{formatMessageTime(message.createdAt)}</Timestamp>
                  </MessageHeader>
                )}
                
                <MessageText>{message.content}</MessageText>
              </MessageContent>
            </MessageContainer>
          </MessageGroup>
        );
      })}
    </Container>
  );
};

export default MessageList;
